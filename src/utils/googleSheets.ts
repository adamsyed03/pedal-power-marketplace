// src/utils/googleSheets.ts
// Send GET requests to Google Apps Script to avoid CORS issues entirely.

import { GAS_WEB_APP_URL } from "../config/gas";

type BuyerPayload = { email: string };
type RenterPayload = { email: string };
type PartnerPayload = {
  firstName?: string;
  lastName?: string;
  city?: string;
  phone?: string;
  email: string;
  model?: string;
  preferredContact?: string;
};

function toQuery(params: Record<string, string>) {
  const usp = new URLSearchParams(params);
  return usp.toString();
}

async function getToSheet(sheetName: string, rowObj: Record<string, any>) {
  // Build URL like: /exec?sheetName=Glide%20Buyers&email=...
  const query = toQuery({
    sheetName,
    // Flatten row fields directly as query params for doGet
    ...Object.entries(rowObj).reduce((acc, [k, v]) => {
      acc[k] = String(v ?? "");
      return acc;
    }, {} as Record<string, string>),
    // cache-buster
    _: String(Date.now())
  });

  const url = `${GAS_WEB_APP_URL}?${query}`;

  // GET + no-cors: avoids CORS and still hits doGet. We don't read response.
  await fetch(url, { method: "GET", mode: "no-cors", cache: "no-store" });

  // Treat as success; verify by checking the Sheet.
  return true;
}

export const submitBuyer   = (p: BuyerPayload)   => getToSheet("Glide Buyers",  p);
export const submitRenter  = (p: RenterPayload)  => getToSheet("Glide Renters", p);
export const submitPartner = (p: PartnerPayload) => getToSheet("Partnership",   p);
