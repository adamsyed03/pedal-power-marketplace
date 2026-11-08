import test from 'node:test';
import assert from 'node:assert/strict';
import { parseSerbianAmount, parseStatementText, parseStatementLayout, sha256 } from '../api/_lib/finance/banca-intesa.mjs';
import { chooseReliableMatches, scorePaymentMatch, splitAllocation, validInventoryTransition } from '../api/_lib/finance/matching.mjs';
import { londonScheduleState } from '../api/_lib/finance/importer.mjs';
import { verifyAdminAccessToken } from '../api/_lib/admin-orders.mjs';

const statement=`Banca Intesa\nIzvod broj 42 računa 160-1234567890123-45\nDatum izvoda 31.10.2026\nPrethodno stanje 100.000,00\n31.10.2026 31.10.2026 UPLATA PETAR PETROVIC poziv na broj 2026-10 20.000,00\n31.10.2026 31.10.2026 NAKNADA BANKE duguje 1.000,00\nNovo stanje 119.000,00`;

test('Serbian numeric formats are parsed',()=>{assert.equal(parseSerbianAmount('1.234.567,89 RSD'),1234567.89)});
test('statement parsing reconciles opening and closing balance',()=>{const parsed=parseStatementText(statement);assert.equal(parsed.statement_number,'42');assert.equal(parsed.transactions.length,2);assert.equal(parsed.reconciliation_difference,0)});
test('statement/file and transaction identities are deterministic',()=>{assert.equal(sha256(Buffer.from(statement)),sha256(Buffer.from(statement)));assert.equal(parseStatementText(statement).transactions[0].fingerprint,parseStatementText(statement).transactions[0].fingerprint)});
test('forwarded subject content does not affect PDF parsing',()=>{assert.equal(parseStatementText(`Fwd: original email\n${statement}`).statement_number,'42')});
test('reliable administrative deduction matches payer, customer, amount and date',()=>{const tx={amount:20000,booked_on:'2026-10-31',description:'UPLATA PETAR PETROVIC 2026-10',counterparty_name:'GRADSKA UPRAVA',payment_reference:'2026-10'};const instalment={amount:20000,received_amount:0,due_on:'2026-10-31'};const schedule={customer_name:'Petar Petrovic',expected_payer:'Gradska uprava',expected_reference:'2026-10'};const scored=scorePaymentMatch(tx,instalment,schedule);assert.ok(scored.confidence>=.88);assert.equal(chooseReliableMatches([scored]).length,1)});
test('ambiguous matches remain manual',()=>{assert.equal(chooseReliableMatches([{confidence:.9},{confidence:.82}]).length,0)});
test('partial and split allocations never exceed transaction or receivable',()=>{const rows=splitAllocation(100,[{amount:70,remaining:60},{amount:70,remaining:70}]);assert.deepEqual(rows.map(x=>x.allocated),[60,40]);assert.equal(rows.reduce((n,x)=>n+x.allocated,0),100)});
test('inventory transition rules separate sale and payment state',()=>{assert.equal(validInventoryTransition('available','sold'),true);assert.equal(validInventoryTransition('sold','available'),false);assert.equal(validInventoryTransition('sold','returned'),true)});
test('admin verification rejects non-admin authenticated customers',async()=>{const fetchImpl=async()=>({ok:true,json:async()=>({email:'customer@example.com'})});assert.equal(await verifyAdminAccessToken('x'.repeat(30),{SUPABASE_URL:'https://example.test',SUPABASE_SERVICE_ROLE_KEY:'secret'},fetchImpl),false)});
test('Europe/London guard follows GMT and BST',()=>{assert.deepEqual(londonScheduleState(new Date('2026-01-15T18:00:00Z')),{hour:18,date:'2026-01-15'});assert.deepEqual(londonScheduleState(new Date('2026-07-15T17:00:00Z')),{hour:18,date:'2026-07-15'});assert.equal(londonScheduleState(new Date('2026-07-15T18:00:00Z')).hour,19)});
test('scheduled import identity supports one run per UK day',()=>{const a=londonScheduleState(new Date('2026-10-25T18:00:00Z'));const b=londonScheduleState(new Date('2026-10-25T19:00:00Z'));assert.equal(a.date,b.date)});

test('Banca Intesa PDF decimals may use US format',()=>{assert.equal(parseSerbianAmount('2,284,713.64'),2284713.64)});
test('positioned Banca Intesa statement with print-only second page reconciles',()=>{
  const items=[
    ['IZVOD BR. 9',511,36],['STANJE I PROMENE SREDSTAVA NA DAN 01.11.2026',416,48],
    ['Broj računa',622,82],['160-1111111111111-11',687,82],
    ['10,000.00',63,158],['10,500.00',330,158],['0.00',165,169],['500.00',251,169],
    ['PROMENE',44,250],['1',41,383],['CUSTOMER',80,383],['500.00',421,383],
    ['Payment received',510,383],['Ukupno za račun 160-1111111111111-11',45,476],['(postoji 1 naloga)',48,490],
  ].map(([text,x,y])=>({text,x,y}));
  const trailing=[['Štampano: 02.11.2026.',45,40],['Strana 2 od 2',755,536]].map(([text,x,y])=>({text,x,y}));
  const parsed=parseStatementLayout({pages:[{items},{items:trailing}]});
  assert.equal(parsed.transactions.length,1);
  assert.equal(parsed.total_credit,500);
  assert.equal(parsed.closing_balance,10500);
  assert.equal(parsed.reconciliation_difference,0);
});
