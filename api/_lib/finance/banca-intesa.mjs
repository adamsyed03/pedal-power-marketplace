import { createHash } from 'node:crypto';

export const PARSER_VERSION='banca-intesa-rs-layout-v2';
export const sha256=(value)=>createHash('sha256').update(value).digest('hex');
export function parseSerbianAmount(value){let raw=String(value??'').trim().replace(/\s/g,'').replace(/[^0-9,.\-]/g,'');if(!raw||!/[0-9]/.test(raw))throw new Error(`Invalid amount: ${value}`);const comma=raw.lastIndexOf(','),dot=raw.lastIndexOf('.');let decimal='';if(comma>=0&&dot>=0)decimal=comma>dot?',':'.';else if(comma>=0)decimal=/,\d{2}$/.test(raw)?',':'';else if(dot>=0)decimal=/\.\d{2}$/.test(raw)?'.':'';if(decimal){const idx=raw.lastIndexOf(decimal);raw=raw.slice(0,idx).replace(/[,.]/g,'')+'.'+raw.slice(idx+1)}else raw=raw.replace(/[,.]/g,'');const amount=Number(raw);if(!Number.isFinite(amount))throw new Error(`Invalid amount: ${value}`);return amount}
const dateValue=(value)=>{const m=String(value).match(/(\d{1,2})[.\/]\s*(\d{1,2})[.\/]\s*(\d{4})/);return m?`${m[3]}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}`:null};
const findAmount=(text,labels)=>{for(const label of labels){const m=text.match(new RegExp(`${label}[^\\d-]{0,30}(-?[\\d.\\s]+,\\d{2})`,'i'));if(m)return parseSerbianAmount(m[1])}return null};
export function parseStatementText(text){
  const normalized=String(text).normalize('NFC').replace(/\u00a0/g,' ').replace(/[ \t]+/g,' ');const number=normalized.match(/Izvod\s+broj\s*[:#]?\s*(\d+)/i)?.[1];const account=normalized.match(/(?:računa|racuna|račun|racun)\s*[:#]?\s*([\d-]{10,})/i)?.[1];const statementDate=dateValue(normalized.match(/(?:datum\s+izvoda|na\s+dan)[^\d]{0,20}(\d{1,2}[.\/]\d{1,2}[.\/]\d{4})/i)?.[1]||'');const opening=findAmount(normalized,['prethodno stanje','početno stanje','pocetno stanje']);const closing=findAmount(normalized,['novo stanje','krajnje stanje','raspoloživo stanje']);
  if(!number||!account||!statementDate||opening==null||closing==null)throw new Error('Required statement header fields were not found.');
  const lines=normalized.split(/\r?\n/).map(x=>x.trim()).filter(Boolean);const transactions=[];let seq=1;
  for(const line of lines){const dates=[...line.matchAll(/\d{1,2}[.\/]\d{1,2}[.\/]\d{4}/g)];const amounts=[...line.matchAll(/(?<![\d-])-?(?:\d{1,3}(?:\.\d{3})+|\d+),\d{2}(?!\d)/g)];if(!dates.length||!amounts.length)continue;const booked=dateValue(dates[0][0]);if(!booked)continue;const rawAmount=parseSerbianAmount(amounts.at(-1)[0]);if(!rawAmount)continue;const debit=/duguje|zaduženje|zaduzenje|debit/i.test(line)||rawAmount<0;const amount=Math.abs(rawAmount);const description=line.replace(dates[0][0],'').replace(amounts.at(-1)[0],'').trim();const reference=line.match(/(?:poziv na broj|referenca)\s*[:]?\s*([A-Z0-9/-]+)/i)?.[1]||null;const counterpartyAccount=line.match(/\b\d{3}-\d{6,13}-\d{2}\b/)?.[0]||null;transactions.push({sequence_no:seq++,booked_on:booked,value_date:dates[1]?dateValue(dates[1][0]):booked,direction:debit?'debit':'credit',amount,currency:'RSD',description,counterparty_name:description.split(/\s{2,}|\|/)[0]?.slice(0,200)||null,counterparty_account:counterpartyAccount,payment_reference:reference,fingerprint:sha256([account,booked,amount,debit?'D':'C',reference||'',description].join('|')),raw_line:line});}
  if(!transactions.length)throw new Error('No transaction rows were parsed.');const totalDebit=transactions.filter(x=>x.direction==='debit').reduce((n,x)=>n+x.amount,0);const totalCredit=transactions.filter(x=>x.direction==='credit').reduce((n,x)=>n+x.amount,0);
  return {account_number:account,statement_year:Number(statementDate.slice(0,4)),statement_number:number,statement_date:statementDate,opening_balance:opening,closing_balance:closing,total_debit:totalDebit,total_credit:totalCredit,currency:'RSD',transactions,reconciliation_difference:Number((closing-(opening+totalCredit-totalDebit)).toFixed(2))};
}
export async function extractPdfText(bytes){const pdfjs=await import('pdfjs-dist/legacy/build/pdf.mjs');const doc=await pdfjs.getDocument({data:new Uint8Array(bytes),useWorkerFetch:false,isEvalSupported:false,useSystemFonts:true}).promise;const pages=[];for(let i=1;i<=doc.numPages;i++){const page=await doc.getPage(i);const content=await page.getTextContent();let lastY=null,line='';const lines=[];for(const item of content.items){const y=item.transform?.[5];if(lastY!=null&&Math.abs(y-lastY)>2){lines.push(line);line='';}line+=(line?' ':'')+item.str;lastY=y;}if(line)lines.push(line);pages.push(lines.join('\n'));}return pages.join('\n');}
export async function parseStatementPdf(bytes){return parseStatementLayout(await extractPdfLayout(bytes))}


/** Preserve PDF text coordinates: Banca Intesa statements are multi-column and cannot safely be parsed by plain line text. */
const moneyMatches=text=>[...String(text).matchAll(/-?(?:\d{1,3}(?:[,.]\d{3})+|\d+)[,.]\d{2}(?!\d)/g)].map(m=>m[0]);
const isDate=text=>/\b\d{2}\.\d{2}\.\d{4}\b/.test(String(text));
const isoDate=value=>{const m=String(value).match(/\b(\d{2})\.(\d{2})\.(\d{4})\b/);if(!m)return null;const iso=m[3]+'-'+m[2]+'-'+m[1];const d=new Date(iso+'T00:00:00Z');return !Number.isNaN(d.getTime())&&d.toISOString().slice(0,10)===iso?iso:null};
const cleanText=value=>String(value??'').normalize('NFC').replace(/\s+/g,' ').trim();
const group=(items,test)=>items.filter(test).sort((a,b)=>a.y-b.y||a.x-b.x).map(a=>a.text).join(' ').replace(/\s+/g,' ').trim();
const amountAt=(items,{xMin,xMax,yMin,yMax,label})=>{const values=items.filter(i=>i.x>=xMin&&i.x<xMax&&i.y>=yMin&&i.y<=yMax).flatMap(i=>moneyMatches(i.text).map(raw=>({raw,y:i.y})));if(values.length!==1)throw new Error('Expected one '+label+' amount, found '+values.length);return parseSerbianAmount(values[0].raw)};

/** Reject ambiguous transaction rows; statement date, totals, and balances must agree before any database import. */
export function parseStatementLayout(layout){
  const pages=Array.isArray(layout)?layout:layout?.pages;
  if(!Array.isArray(pages)||!pages.length)throw new Error('No PDF layout pages');
  const all=pages.flatMap((page,i)=>(Array.isArray(page)?page:page.items).map(item=>({...item,text:cleanText(item.text),page:i})).filter(i=>i.text));
  if(!all.length)throw new Error('Empty PDF');
  const headings=group(all,i=>i.page===0&&i.y<115);
  const number=headings.match(/IZVOD\s*BR\.?\s*(\d+)/i)?.[1];
  const date=isoDate(headings.match(/SREDSTAVA\s+NA\s+DAN\s+(\d{2}\.\d{2}\.\d{4})/i)?.[1]||'');
  const acc=headings.match(/Broj\s+računa\s+(\d{3}-\d{6,15}-\d{2})/i)?.[1];
  if(!number||!date||!acc)throw new Error('Banca Intesa statement identity/date/account not found');
  const first=all.filter(i=>i.page===0);
  const opening=amountAt(first,{xMin:50,xMax:145,yMin:150,yMax:178,label:'opening balance'});
  const closing=amountAt(first,{xMin:325,xMax:421,yMin:150,yMax:170,label:'closing balance'});
  const totalDebit=amountAt(first,{xMin:145,xMax:230,yMin:150,yMax:180,label:'debit turnover'});
  const totalCredit=amountAt(first,{xMin:230,xMax:322,yMin:150,yMax:180,label:'credit turnover'});
  const transactions=[];
  for(let pi=0;pi<pages.length;pi++){
    const items=all.filter(i=>i.page===pi);
    const promena=items.find(i=>i.x<100&&/^PROMENE$/i.test(i.text));
    const footer=items.find(i=>i.x<125&&/^Ukupno\s+za\s+račun/i.test(i.text));
    if(!promena||!footer){
      // Some official statements add a trailing print-date/reserved-funds page without transactions.
      if(pi>0&&!promena&&!footer&&items.length<=20&&items.some(i=>/Strana\s+\d+\s+od\s+\d+/i.test(i.text)))continue;
      throw new Error('Statement page '+(pi+1)+' missing transaction header or footer');
    }
    const markers=items.filter(i=>i.x>=35&&i.x<60&&i.y>promena.y+20&&i.y<footer.y-12&&/^\d{1,3}$/.test(i.text)).sort((a,b)=>a.y-b.y);
    for(let k=0;k<markers.length;k++){
      const marker=markers[k],seq=Number(marker.text);
      if(transactions.some(t=>t.sequence_no===seq))throw new Error('Duplicate transaction sequence '+seq);
      const start=Math.max(promena.y+20,marker.y-31),end=k+1<markers.length?markers[k+1].y-14:footer.y-11;
      const body=items.filter(i=>i.y>=start&&i.y<=end);
      const amounts=body.filter(i=>i.y>=marker.y-8&&i.y<=marker.y+8&&i.x>=338&&i.x<483).flatMap(i=>moneyMatches(i.text).map(raw=>({amount:parseSerbianAmount(raw),x:i.x})));
      if(amounts.length!==1||amounts[0].amount<=0)throw new Error('Ambiguous amount in row '+seq);
      const direction=amounts[0].x>=418?'credit':'debit';
      const counterparty=group(body,i=>i.x>=65&&i.x<235);
      const description=group(body,i=>i.x>=505&&i.x<638);
      const references=group(body,i=>i.x>=638&&i.x<=815);
      const counterpartyAccount=counterparty.match(/\b\d{3}-\d{6,15}-\d{2}\b/)?.[0]||null;
      const dateItems=body.filter(i=>i.x>=235&&i.x<=320&&isDate(i.text)).sort((a,b)=>a.y-b.y);
      const valueDate=isoDate(dateItems.at(-1)?.text||'')||date;
      const amount=amounts[0].amount;
      transactions.push({sequence_no:seq,booked_on:date,value_date:valueDate,direction,amount,currency:'RSD',
        counterparty_name:counterparty.replace(counterpartyAccount||'','').trim().slice(0,300)||null,
        counterparty_account:counterpartyAccount,description:description||counterparty||'',
        payment_reference:references||null,
        fingerprint:sha256([acc,date,number,seq,direction,amount].join('|'))});
    }
    const footerText=group(items,i=>i.y>=footer.y-2&&i.y<=footer.y+20&&i.x<300);
    const rowCount=Number(footerText.match(/postoji\s+(\d+)\s+naloga/i)?.[1]);
    if(Number.isInteger(rowCount)&&rowCount!==markers.length)throw new Error('Page '+(pi+1)+' expected '+rowCount+' transaction(s) but found '+markers.length);
  }
  if(!transactions.length)throw new Error('No transactions found');
  const sumDebit=Number(transactions.filter(t=>t.direction==='debit').reduce((sum,t)=>sum+t.amount,0).toFixed(2));
  const sumCredit=Number(transactions.filter(t=>t.direction==='credit').reduce((sum,t)=>sum+t.amount,0).toFixed(2));
  const difference=Number((closing-(opening+sumCredit-sumDebit)).toFixed(2));
  if(Math.abs(sumDebit-totalDebit)>0.005||Math.abs(sumCredit-totalCredit)>0.005||difference!==0)throw new Error('Bank statement turnover/balance reconciliation failed');
  return {account_number:acc,statement_year:Number(date.slice(0,4)),statement_number:number,statement_date:date,opening_balance:opening,closing_balance:closing,total_debit:sumDebit,total_credit:sumCredit,currency:'RSD',transactions,reconciliation_difference:difference};
}

export async function extractPdfLayout(bytes){
  const pdfjs=await import('pdfjs-dist/legacy/build/pdf.mjs');
  const doc=await pdfjs.getDocument({data:new Uint8Array(bytes),useWorkerFetch:false,isEvalSupported:false,useSystemFonts:true}).promise;
  const pages=[];
  for(let p=1;p<=doc.numPages;p++){
    const page=await doc.getPage(p),viewport=page.getViewport({scale:1}),content=await page.getTextContent();
    pages.push({items:content.items.filter(i=>typeof i.str==='string'&&i.transform?.length>=6).map(i=>({text:i.str,x:Number(i.transform[4]),y:viewport.height-Number(i.transform[5])})),width:viewport.width,height:viewport.height});
  }
  return {pages};
}
