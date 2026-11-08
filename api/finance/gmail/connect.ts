import { verifyAdminAccessToken } from '../../_lib/admin-orders.mjs';
import { authorizationUrl } from '../../_lib/finance/gmail.mjs';
import { oauthState } from '../../_lib/finance/crypto.mjs';

const bearer=(request:any)=>String(request.headers?.authorization||'').startsWith('Bearer ')?String(request.headers.authorization).slice(7):'';
export default async function handler(request:any,response:any){response.setHeader('Cache-Control','no-store');if(request.method!=='POST')return response.status(405).json({error:'Method not allowed.'});try{if(!await verifyAdminAccessToken(bearer(request)))return response.status(401).json({error:'Admin login required.'});const state=oauthState();response.setHeader('Set-Cookie', `pogon_gmail_oauth_state=${encodeURIComponent(state)}; Path=/api/finance/gmail; HttpOnly; Secure; SameSite=Lax; Max-Age=600`);return response.status(200).json({url:authorizationUrl(state)});}catch(e){return response.status(500).json({error:e instanceof Error?e.message:'Gmail connection could not start.'});}}
