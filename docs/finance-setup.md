# Pogon Finance deployment runbook

The Finance workspace is additive. `/admin` remains the Sales CRM; the new routes are `/admin/finance`, `/analytics`, `/payments`, and `/inventory`.

## 1. Apply the database migration

Review and apply `supabase/migrations/20261108180000_finance_workspace.sql` with the Supabase CLI or SQL editor. It creates finance tables, functions, indexes, RLS policies, and the private `finance-documents` bucket. It does not modify or delete existing `leads` or `orders` rows.

CLI example:

```sh
supabase link --project-ref cirrgscedpitegcahklq
supabase db push
```

Verify that RLS is enabled on every new table and that a non-admin authenticated account cannot select finance rows.

## 2. Google Cloud OAuth

1. In Google Cloud Console create or select a dedicated project.
2. Enable the Gmail API.
3. Configure the OAuth consent screen. Use `Internal` only when the Gmail account is in the same Workspace organization; otherwise use `External`, add the owner as a test user until verification is complete, and publish when appropriate.
4. Create a Web application OAuth client.
5. Add the exact production redirect URI: `https://ridepogon.com/api/finance/gmail/callback` (and the equivalent preview/test URI only if you will test there).
6. No broad Gmail permissions are requested. The app requests only `https://www.googleapis.com/auth/gmail.readonly`, with offline access for scheduled imports.
7. Add the client ID and secret to Vercel as server-only environment variables.
8. Deploy, sign in at `/admin/finance`, click **Gmail connection**, and approve access with the mailbox that receives Banca Intesa statements.

## 3. Required server secrets

- `SUPABASE_URL` — existing project URL.
- `SUPABASE_SERVICE_ROLE_KEY` — existing service-role key; server-only.
- `GOOGLE_GMAIL_CLIENT_ID` and `GOOGLE_GMAIL_CLIENT_SECRET` — OAuth web client.
- `GOOGLE_GMAIL_REDIRECT_URI` — exact callback URL above.
- `GMAIL_TOKEN_ENCRYPTION_KEY` — 32 random bytes encoded as base64 or 64 hex characters. Example generation: `openssl rand -base64 32`.
- `GMAIL_OAUTH_STATE_SECRET` — at least 32 random bytes, e.g. `openssl rand -base64 32`.
- `CRON_SECRET` — a long random value used by Vercel Cron, e.g. `openssl rand -hex 32`.

Never prefix these names with `VITE_`; doing so would expose them to the browser. Configure all values for Production and the intended Preview environment, then redeploy.

## 4. Scheduler

`vercel.json` calls `/api/finance/import?scheduled=1` at 17:00 UTC and 18:00 UTC using separate, Hobby-compatible daily cron jobs. The server checks `Europe/London` and imports only when local time is between 18:00 and 18:59. Vercel Hobby does not guarantee minute-level cron precision, so imports may start later within that hour. The unique `(scheduled, UK calendar date)` import-run constraint prevents duplicate scheduled runs, including across the autumn DST change. A failed scheduled run requires manual recovery; it will not be retried automatically that day. Vercel sends `Authorization: Bearer $CRON_SECRET` automatically when that project variable is configured.

## 5. Validation and first backfill

1. Run `npm test` and `npm run build`.
2. Confirm `/admin` is unchanged and `/admin/finance` requires the same Supabase admin login.
3. Connect Gmail and use **Import now** for a small current batch.
4. Compare the statement opening balance, credits, debits, closing balance, and PDF with Banca Intesa. Any difference must remain in `review` status.
5. For historical backfill, call `POST /api/finance/import?backfill=1` with the admin bearer token. The importer processes Gmail pages idempotently and records import attempts in `finance_import_runs`. Full chronological, resumable backfill needs validation before production use.
6. Import inventory from CSV after preview. Minimum headers: `model,chassis_number`; supported optional headers include `status,received_on,purchase_cost,landed_cost,retail_price,currency,storage_location,battery_status,notes`.

## 6. Operational notes

- Original statements are private Storage objects; OAuth tokens are AES-256-GCM encrypted and readable only by service-role backend code.
- Automatic payment allocation is OFF by default. To enable it after validating real statements, set `FINANCE_AUTOMATCH_ENABLED=true` server-side. Ambiguous matches remain in `payment_match_suggestions` for review.
- OAuth requests bind the state to an HttpOnly same-site cookie; the callback requires this cookie.
- Import only allocates payments for statements that reconcile successfully.
- Bank cash flow is separate from P&L. Gross/net profit remains unavailable until landed costs and expense categories are sufficiently recorded.
- Meta Ads and Google Ads cost metrics intentionally show as unavailable until reporting APIs and attribution are connected.
