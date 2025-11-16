# Google Apps Script Deployment Instructions

## IMPORTANT: Make sure the script is deployed as a WEB APP, not a library!

## Step-by-Step Deployment:

1. **Open your Google Sheet** (Pogon Database)

2. **Open Google Apps Script**:
   - Go to Extensions → Apps Script

3. **Delete ALL existing code** and paste this code:

```javascript
function doPost(e) {
  try {
    // Handle CORS preflight
    if (e.parameter && e.parameter.method === 'OPTIONS') {
      return ContentService.createTextOutput('')
        .setMimeType(ContentService.MimeType.TEXT)
        .setHeaders({
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        });
    }

    // Parse the data - handle both form data and JSON
    let sheetName, data;
    
    if (e.postData && e.postData.contents) {
      // JSON body
      const parsed = JSON.parse(e.postData.contents);
      sheetName = parsed.sheetName;
      data = parsed.data;
    } else if (e.parameter) {
      // Form data
      sheetName = e.parameter.sheetName;
      data = JSON.parse(e.parameter.data || '[]');
    } else {
      throw new Error('No data received');
    }
    
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
    
    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({ 
        success: false, 
        error: 'Sheet not found: ' + sheetName 
      }))
        .setMimeType(ContentService.MimeType.JSON)
        .setHeaders({
          'Access-Control-Allow-Origin': '*',
        });
    }
    
    // Append the data as a new row
    sheet.appendRow(data);
    
    return ContentService.createTextOutput(JSON.stringify({ 
      success: true 
    }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders({
        'Access-Control-Allow-Origin': '*',
      });
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ 
      success: false, 
      error: error.toString() 
    }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders({
        'Access-Control-Allow-Origin': '*',
      });
  }
}

// Handle GET requests (used by the app)
function doGet(e) {
  try {
    // Get parameters from URL
    const sheetName = e.parameter.sheetName;
    const dataParam = e.parameter.data;
    
    if (!sheetName || !dataParam) {
      return ContentService.createTextOutput(JSON.stringify({ 
        success: false, 
        error: 'Missing parameters' 
      }))
        .setMimeType(ContentService.MimeType.JSON)
        .setHeaders({
          'Access-Control-Allow-Origin': '*',
        });
    }
    
    const data = JSON.parse(dataParam);
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
    
    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({ 
        success: false, 
        error: 'Sheet not found: ' + sheetName 
      }))
        .setMimeType(ContentService.MimeType.JSON)
        .setHeaders({
          'Access-Control-Allow-Origin': '*',
        });
    }
    
    // Append the data as a new row
    sheet.appendRow(data);
    
    return ContentService.createTextOutput(JSON.stringify({ 
      success: true 
    }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders({
        'Access-Control-Allow-Origin': '*',
      });
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ 
      success: false, 
      error: error.toString() 
    }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders({
        'Access-Control-Allow-Origin': '*',
      });
  }
}
```

4. **Save the script** (Ctrl+S or Cmd+S)

5. **Deploy as Web App**:
   - Click "Deploy" button in the top right
   - Click "New deployment"
   - Click the gear icon ⚙️ (settings)
   - Select type: **"Web app"** (IMPORTANT: NOT Library!)
   - Description: "Pogon Forms Handler" (optional)
   - Execute as: **"Me"** (your email)
   - Who has access: **"Anyone"** (THIS IS CRITICAL!)
   - Click "Deploy"

6. **Authorize the script** (first time only):
   - You'll see "Authorization required"
   - Click "Authorize access"
   - Choose your Google account
   - Click "Advanced" → "Go to [Project Name] (unsafe)"
   - Click "Allow"

7. **Copy the Web App URL**:
   - After deployment, you'll see a URL like:
   - `https://script.google.com/macros/s/AKfycb.../exec`
   - Click "Copy URL"

8. **Update the code**:
   - The URL in `src/utils/googleSheets.ts` is already set to your deployment ID
   - The URL is: `https://script.google.com/macros/s/AKfycbwo_ImIZ3cXHhuEI2OkRKE522AE5pVcYvclX8S8GaVmjRcD2t6vER7vsRL4jTFLqW87cA/exec`
   - Make sure this matches your deployment URL

9. **Test it**:
   - Open this URL in a browser (it should NOT ask you to sign in if deployed correctly):
   - `https://script.google.com/macros/s/AKfycbwo_ImIZ3cXHhuEI2OkRKE522AE5pVcYvclX8S8GaVmjRcD2t6vER7vsRL4jTFLqW87cA/exec?sheetName=Glide%20Buyers&data=["2024-01-01T00:00:00.000Z","test@example.com"]`
   - If it works, you should see `{"success":true}` and a row should appear in your "Glide Buyers" sheet

## Troubleshooting:

- **If the URL asks you to sign in**: The deployment is NOT set to "Anyone". Go back and redeploy with "Anyone" access.
- **If nothing appears in the sheet**: Check the "Executions" tab in Apps Script to see if there are errors
- **If you see errors in Executions**: Click on the execution to see the error message

## Verify your sheets have these exact names:
- `Partnership`
- `Glide Renters`
- `Glide Buyers`

Make sure the names match EXACTLY (case-sensitive).

