/**
 * Google Sheets Integration via Google Apps Script
 * 
 * SETUP INSTRUCTIONS:
 * 1. Create a Google Sheet with these sheets:
 *    - "Sign Up" (columns: Timestamp, Email)
 *    - "Refer a Friend" (columns: Timestamp, First Name, Last Name, City, Phone, Email, Preferred Contact)
 *    - "Buy a Bike" (columns: Timestamp, First Name, Last Name, City, Phone, Email, Model, Preferred Contact)
 *    - "Rent a Bike" (columns: Timestamp, First Name, Last Name, City, Phone, Email, Model, Duration, Preferred Contact)
 * 
 * 2. In Google Sheets, go to Extensions > Apps Script
 * 3. Paste this code:
 * 
 * function doPost(e) {
 *   try {
 *     const sheet = SpreadsheetApp.getActiveSpreadsheet();
 *     const data = JSON.parse(e.postData.contents);
 *     const type = data.type;
 *     const formData = data.data;
 *     
 *     let targetSheet;
 *     switch(type) {
 *       case 'signup':
 *         targetSheet = sheet.getSheetByName('Sign Up');
 *         targetSheet.appendRow([new Date(), formData.email]);
 *         break;
 *       case 'refer':
 *         targetSheet = sheet.getSheetByName('Refer a Friend');
 *         targetSheet.appendRow([
 *           new Date(),
 *           formData.firstName,
 *           formData.lastName,
 *           formData.city,
 *           formData.phone,
 *           formData.email,
 *           formData.preferredContact
 *         ]);
 *         break;
 *       case 'buy':
 *         targetSheet = sheet.getSheetByName('Buy a Bike');
 *         targetSheet.appendRow([
 *           new Date(),
 *           formData.firstName,
 *           formData.lastName,
 *           formData.city,
 *           formData.phone,
 *           formData.email,
 *           formData.model || '',
 *           formData.preferredContact
 *         ]);
 *         break;
 *       case 'rent':
 *         targetSheet = sheet.getSheetByName('Rent a Bike');
 *         targetSheet.appendRow([
 *           new Date(),
 *           formData.firstName,
 *           formData.lastName,
 *           formData.city,
 *           formData.phone,
 *           formData.email,
 *           formData.model || '',
 *           formData.duration || '',
 *           formData.preferredContact
 *         ]);
 *         break;
 *       default:
 *         return ContentService.createTextOutput(JSON.stringify({error: 'Invalid type'})).setMimeType(ContentService.MimeType.JSON);
 *     }
 *     
 *     return ContentService.createTextOutput(JSON.stringify({success: true})).setMimeType(ContentService.MimeType.JSON);
 *   } catch(error) {
 *     return ContentService.createTextOutput(JSON.stringify({error: error.toString()})).setMimeType(ContentService.MimeType.JSON);
 *   }
 * }
 * 
 * 4. Save the script and deploy it as a web app:
 *    - Click Deploy > New deployment
 *    - Choose type: Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 *    - Click Deploy
 *    - Copy the Web App URL
 * 
 * 5. Add the URL to your .env file as VITE_GOOGLE_SHEETS_WEB_APP_URL
 */

export type FormType = 'signup' | 'refer' | 'buy' | 'rent';

export interface ReferFormData {
  firstName: string;
  lastName: string;
  city: string;
  phone: string;
  email: string;
  preferredContact: string;
}

export interface SignUpFormData {
  email: string;
}

export interface BuyRentFormData extends ReferFormData {
  model?: string;
  duration?: string; // Only for rent
}

/**
 * Submit form data to Google Sheets
 */
export async function submitToGoogleSheets(
  type: FormType,
  data: ReferFormData | SignUpFormData | BuyRentFormData
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get the web app URL from environment variables
    const webAppUrl = import.meta.env.VITE_GOOGLE_SHEETS_WEB_APP_URL;

    if (!webAppUrl) {
      console.error('Google Sheets Web App URL is not configured');
      return {
        success: false,
        error: 'Google Sheets integration is not configured. Please contact support.',
      };
    }

    const response = await fetch(webAppUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type,
        data,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      return {
        success: false,
        error: errorData.error || 'Failed to submit form',
      };
    }

    const result = await response.json();
    return {
      success: result.success || false,
      error: result.error,
    };
  } catch (error) {
    console.error('Error submitting to Google Sheets:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to submit form',
    };
  }
}
