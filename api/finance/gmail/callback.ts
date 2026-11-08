import { connectGmail, exchangeCode } from '../../_lib/finance/gmail.mjs';
import { verifyOauthState } from '../../_lib/finance/crypto.mjs';

export default async function handler(request:any,response:any){response.setHeader('Cache-Control','no-store');try{const code=String(request.query?.code||'');const state=String(request.query?.state||'');if(!code||!verifyOauthState(state))return response.status(400).send('Invalid or expired OAuth request.');const email=await connectGmail(await exchangeCode(code));response.setHeader('Location',`/admin/finance?gmail=connected&email=${encodeURIComponent(email)}`);return response.status(302).end();}catch(e){return response.status(500).send(e instanceof Error?e.message:'Gmail connection failed.');}}
