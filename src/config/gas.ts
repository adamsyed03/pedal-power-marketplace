// src/config/gas.ts
// Single source of truth for the Google Apps Script Web App endpoint.

export const GAS_WEB_APP_URL =
  'https://script.google.com/macros/s/AKfycbwLS3pg5066EyJ_p2hxEXHksZ8YdyDjiA1Vhl8IZF7PA0JJEDVvDsxy74fhdiRNF5_HXg/exec';

// Deployment ID for reference (not used in code, but keep it here)
export const GAS_DEPLOYMENT_ID =
  'AKfycbwLS3pg5066EyJ_p2hxEXHksZ8YdyDjiA1Vhl8IZF7PA0JJEDVvDsxy74fhdiRNF5_HXg';

if (import.meta.env.DEV) {
  // eslint-disable-next-line no-console
  console.log("[GAS] Using Web App URL:", GAS_WEB_APP_URL);
}

