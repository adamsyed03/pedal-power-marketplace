import { dbRequest } from '../supabase.mjs';
import { findStatementPdfs, gmailAccessToken } from './gmail.mjs';
import { parseStatementPdf, PARSER_VERSION, sha256 } from './banca-intesa.mjs';
import { chooseReliableMatches, scorePaymentMatch } from './matching.mjs';

const ukParts=(date=new Date())=>Object.fromEntries(new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/London',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',hourCycle:'h23'}).formatToParts(date).map(x=>[x.type,x.value]));
export function londonScheduleState(date=new Date()){const p=ukParts(date);return {hour:Number(p.hour),date:`${p.year}-${p.month}-${p.day}`}}

async function storageUpload(path,bytes,env,fetchImpl){const base=env.SUPABASE_URL.replace(/\/$/,'');const response=await fetchImpl(`${base}/storage/v1/object/finance-documents/${path}`,{method:'POST',headers:{apikey:env.SUPABASE_SERVICE_ROLE_KEY,Authorization:`Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,'Content-Type':'application/pdf','x-upsert':'false'},body:bytes});if(!response.ok&&response.status!==409)throw new Error(`Statement storage failed (${response.status}).`)}

async function startRun(type,ukDate,env,fetchImpl){try{const rows=await dbRequest('finance_import_runs',{method:'POST',headers:{Prefer:'return=representation'},body:JSON.stringify({import_type:type,uk_business_date:ukDate,status:'running'})},env,fetchImpl);return rows[0]}catch(e){if(String(e.message).includes('409'))return null;throw e}}
async function finishRun(id,changes,env,fetchImpl){await dbRequest(`finance_import_runs?id=eq.${id}`,{method:'PATCH',headers:{Prefer:'return=minimal'},body:JSON.stringify({...changes,completed_at:new Date().toISOString()})},env,fetchImpl)}

async function categoriseAndMatch(statementId,env,fetchImpl){
  const [transactions,rules,instalments]=await Promise.all([
    dbRequest(`bank_transactions?statement_id=eq.${statementId}&select=*`,{},env,fetchImpl),
    dbRequest('categorisation_rules?select=*&order=priority.asc',{},env,fetchImpl),
    dbRequest('payment_instalments?select=*,payment_schedules(*)&status=in.(upcoming,partially_paid,overdue)&order=due_on.asc&limit=1000',{},env,fetchImpl),
  ]);let autoAllocated=0,suggestions=0;
  for(const transaction of transactions){
    const rule=rules.find(r=>{if(r.direction&&r.direction!==transaction.direction)return false;const value=String(transaction[r.field]||'');if(r.operator==='equals')return value.toLowerCase()===String(r.pattern).toLowerCase();if(r.operator==='regex'){try{return new RegExp(r.pattern,'iu').test(value)}catch{return false}}return value.toLowerCase().includes(String(r.pattern).toLowerCase())});
    if(rule)await dbRequest(`bank_transactions?id=eq.${transaction.id}`,{method:'PATCH',headers:{Prefer:'return=minimal'},body:JSON.stringify({category_id:rule.category_id,categorisation_confidence:rule.auto_apply?1:.75})},env,fetchImpl);
    if(transaction.direction!=='credit')continue;
    const candidates=instalments.map(i=>({...scorePaymentMatch(transaction,i,i.payment_schedules||{}),instalment_id:i.id})).filter(x=>x.confidence>=.45&&x.suggested_amount>0);
    for(const candidate of candidates.slice(0,8)){await dbRequest('payment_match_suggestions?on_conflict=bank_transaction_id,instalment_id',{method:'POST',headers:{Prefer:'resolution=ignore-duplicates,return=minimal'},body:JSON.stringify({bank_transaction_id:transaction.id,instalment_id:candidate.instalment_id,suggested_amount:candidate.suggested_amount,confidence:candidate.confidence,reasons:candidate.reasons})},env,fetchImpl);suggestions++}
    const [winner]=chooseReliableMatches(candidates);if(winner){const key=sha256(`${transaction.id}:${winner.instalment_id}:${winner.suggested_amount}`);await dbRequest('payment_allocations?on_conflict=idempotency_key',{method:'POST',headers:{Prefer:'resolution=ignore-duplicates,return=minimal'},body:JSON.stringify({bank_transaction_id:transaction.id,instalment_id:winner.instalment_id,amount:winner.suggested_amount,currency:transaction.currency,allocation_source:'automatic',confidence:winner.confidence,payment_reference:transaction.payment_reference,paid_on:transaction.booked_on,idempotency_key:key})},env,fetchImpl);autoAllocated++}
  }return {autoAllocated,suggestions};
}

export async function runFinanceImport({type='manual',backfill=false,now=new Date(),env=process.env,fetchImpl=fetch}={}){
  const london=londonScheduleState(now);if(type==='scheduled'&&london.hour!==18)return {skipped:true,reason:'outside_london_18',ukDate:london.date};
  const run=await startRun(type,type==='scheduled'?london.date:null,env,fetchImpl);if(!run)return {skipped:true,reason:'already_processed',ukDate:london.date};
  const totals={emails_scanned:0,statements_imported:0,transactions_imported:0,duplicate_count:0,error_count:0,auto_allocated:0,match_suggestions:0};const errors=[];
  try{const token=await gmailAccessToken(env,fetchImpl);let pageToken=null;do{const page=await findStatementPdfs(token,{pageToken,maxResults:backfill?50:25},fetchImpl);pageToken=page.nextPageToken;for(const file of page.items){totals.emails_scanned++;try{const hash=sha256(file.bytes);const parsed=await parseStatementPdf(file.bytes);const path=`bank-statements/${parsed.statement_year}/${parsed.account_number.replace(/\D/g,'')}/${parsed.statement_number}-${hash.slice(0,12)}.pdf`;await storageUpload(path,file.bytes,env,fetchImpl);const statement={...parsed,transactions:undefined,source_email_id:file.messageId,source_email_subject:file.subject,source_file_hash:hash,storage_path:path,parser_version:PARSER_VERSION};const committed=await dbRequest('rpc/finance_commit_bank_statement',{method:'POST',body:JSON.stringify({p_statement:statement,p_transactions:parsed.transactions})},env,fetchImpl);if(committed.duplicate)totals.duplicate_count++;else{totals.statements_imported++;totals.transactions_imported+=committed.transactions||0;const matching=await categoriseAndMatch(committed.statement_id,env,fetchImpl);totals.auto_allocated+=matching.autoAllocated;totals.match_suggestions+=matching.suggestions;if(!committed.reconciled){totals.error_count++;errors.push({file:file.filename,code:'BALANCE_MISMATCH',difference:committed.difference});}}}catch(e){totals.error_count++;errors.push({file:file.filename,code:'PARSE_OR_IMPORT_FAILED',message:String(e.message).slice(0,500)});}}}while(backfill&&pageToken);
    await finishRun(run.id,{...totals,status:totals.error_count?'partial':'completed',details:{errors}},env,fetchImpl);return {runId:run.id,...totals,errors};
  }catch(e){await finishRun(run.id,{...totals,status:'failed',error_count:totals.error_count+1,details:{errors:[...errors,{code:'IMPORT_FAILED',message:String(e.message).slice(0,500)}]}},env,fetchImpl);throw e}
}
