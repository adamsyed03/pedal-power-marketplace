import { dbRequest } from '../supabase.mjs';
import { decryptSecret, encryptSecret } from './crypto.mjs';

const tokenUrl = 'https://oauth2.googleapis.com/token';
const gmail = 'https://gmail.googleapis.com/gmail/v1/users/me';

export const gmailScope = 'https://www.googleapis.com/auth/gmail.readonly';

export function googleConfig(env = process.env) {
  for (const name of ['GOOGLE_GMAIL_CLIENT_ID','GOOGLE_GMAIL_CLIENT_SECRET','GOOGLE_GMAIL_REDIRECT_URI']) if (!env[name]) throw new Error(`${name} is not configured.`);
  return { clientId: env.GOOGLE_GMAIL_CLIENT_ID, clientSecret: env.GOOGLE_GMAIL_CLIENT_SECRET, redirectUri: env.GOOGLE_GMAIL_REDIRECT_URI };
}

export function authorizationUrl(state, env = process.env) {
  const c = googleConfig(env); const query = new URLSearchParams({ client_id:c.clientId,redirect_uri:c.redirectUri,response_type:'code',scope:gmailScope,access_type:'offline',prompt:'consent',include_granted_scopes:'false',state });
  return `https://accounts.google.com/o/oauth2/v2/auth?${query}`;
}

export async function exchangeCode(code, env = process.env, fetchImpl = fetch) {
  const c=googleConfig(env); const response=await fetchImpl(tokenUrl,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({code,client_id:c.clientId,client_secret:c.clientSecret,redirect_uri:c.redirectUri,grant_type:'authorization_code'})});
  const body=await response.json(); if(!response.ok||!body.refresh_token) throw new Error(body.error_description||'Google did not return an offline refresh token.'); return body;
}

export async function connectGmail(tokens, env=process.env, fetchImpl=fetch){
  const profileResponse=await fetchImpl(`${gmail}/profile`,{headers:{Authorization:`Bearer ${tokens.access_token}`}}); const profile=await profileResponse.json(); if(!profileResponse.ok||!profile.emailAddress)throw new Error('Could not read the Gmail profile.');
  const row={owner_email:String(profile.emailAddress).toLowerCase(),encrypted_refresh_token:encryptSecret(tokens.refresh_token,env),encrypted_access_token:encryptSecret(tokens.access_token,env),token_expires_at:new Date(Date.now()+Number(tokens.expires_in||3600)*1000).toISOString(),scopes:String(tokens.scope||gmailScope).split(' '),gmail_history_id:profile.historyId,updated_at:new Date().toISOString()};
  await dbRequest('gmail_connections?on_conflict=owner_email',{method:'POST',headers:{Prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify(row)},env,fetchImpl); return row.owner_email;
}

async function connection(env,fetchImpl){const rows=await dbRequest('gmail_connections?select=*&order=updated_at.desc&limit=1',{},env,fetchImpl);if(!rows[0])throw new Error('Gmail is not connected.');return rows[0]}

export async function gmailAccessToken(env=process.env,fetchImpl=fetch){const row=await connection(env,fetchImpl);if(row.encrypted_access_token&&new Date(row.token_expires_at).getTime()>Date.now()+60_000)return decryptSecret(row.encrypted_access_token,env);const c=googleConfig(env);const response=await fetchImpl(tokenUrl,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({client_id:c.clientId,client_secret:c.clientSecret,refresh_token:decryptSecret(row.encrypted_refresh_token,env),grant_type:'refresh_token'})});const body=await response.json();if(!response.ok)throw new Error(body.error_description||'Gmail token refresh failed.');await dbRequest(`gmail_connections?id=eq.${row.id}`,{method:'PATCH',headers:{Prefer:'return=minimal'},body:JSON.stringify({encrypted_access_token:encryptSecret(body.access_token,env),token_expires_at:new Date(Date.now()+Number(body.expires_in||3600)*1000).toISOString(),updated_at:new Date().toISOString()})},env,fetchImpl);return body.access_token}

const decode=(value='')=>Buffer.from(value.replace(/-/g,'+').replace(/_/g,'/'),'base64');
const parts=(node,out=[])=>{if(node?.body?.attachmentId&&/application\/pdf/i.test(node.mimeType||''))out.push(node);for(const child of node?.parts||[])parts(child,out);return out};

export async function findStatementPdfs(accessToken,{pageToken,maxResults=25}={},fetchImpl=fetch){
  const q='subject:("Izvod broj" OR "izvod racuna") has:attachment filename:pdf'; const listUrl=new URL(`${gmail}/messages`);listUrl.searchParams.set('q',q);listUrl.searchParams.set('maxResults',String(maxResults));if(pageToken)listUrl.searchParams.set('pageToken',pageToken);
  const listed=await fetchImpl(listUrl,{headers:{Authorization:`Bearer ${accessToken}`}}).then(r=>r.json());const found=[];
  for(const item of listed.messages||[]){const message=await fetchImpl(`${gmail}/messages/${item.id}?format=full`,{headers:{Authorization:`Bearer ${accessToken}`}}).then(r=>r.json());const headers=Object.fromEntries((message.payload?.headers||[]).map(h=>[String(h.name).toLowerCase(),h.value]));if(!/izvod broj/i.test(headers.subject||''))continue;for(const part of parts(message.payload)){const attachment=await fetchImpl(`${gmail}/messages/${item.id}/attachments/${part.body.attachmentId}`,{headers:{Authorization:`Bearer ${accessToken}`}}).then(r=>r.json());found.push({messageId:item.id,threadId:item.threadId,subject:headers.subject||'',from:headers.from||'',date:headers.date||'',filename:part.filename||`${item.id}.pdf`,bytes:decode(attachment.data)});}}
  return {items:found,nextPageToken:listed.nextPageToken||null};
}
