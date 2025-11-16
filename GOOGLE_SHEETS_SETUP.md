# Google Sheets Integration Setup Guide

This guide will help you connect your website forms to a Google Sheets document.

## 📋 Prerequisites

- A Google account
- Access to Google Sheets
- Basic familiarity with Google Apps Script

## 🔧 Setup Instructions

### Step 1: Create a Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it something like "Pogon Website Submissions"

### Step 2: Create the Required Sheets

Create 4 separate sheets within your Google Sheet:

1. **"Sign Up"** - For waitlist signups
2. **"Refer a Friend"** - For referral/partnership forms
3. **"Buy a Bike"** - For purchase inquiries
4. **"Rent a Bike"** - For rental inquiries

### Step 3: Set Up Column Headers

Set up the following column headers in each sheet:

#### Sign Up Sheet
```
A1: Timestamp
B1: Email
```

#### Refer a Friend Sheet
```
A1: Timestamp
B1: First Name
C1: Last Name
D1: City
E1: Phone
F1: Email
G1: Preferred Contact
```

#### Buy a Bike Sheet
```
A1: Timestamp
B1: First Name
C1: Last Name
D1: City
E1: Phone
F1: Email
G1: Model
H1: Preferred Contact
```

#### Rent a Bike Sheet
```
A1: Timestamp
B1: First Name
C1: Last Name
D1: City
E1: Phone
F1: Email
G1: Model
H1: Duration
I1: Preferred Contact
```

### Step 4: Create Google Apps Script

1. In your Google Sheet, go to **Extensions** → **Apps Script**
2. Delete any default code
3. Paste the following code:

```javascript
function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet();
    const data = JSON.parse(e.postData.contents);
    const type = data.type;
    const formData = data.data;
    
    let targetSheet;
    switch(type) {
      case 'signup':
        targetSheet = sheet.getSheetByName('Sign Up');
        if (!targetSheet) {
          return ContentService.createTextOutput(JSON.stringify({error: 'Sign Up sheet not found'})).setMimeType(ContentService.MimeType.JSON);
        }
        targetSheet.appendRow([new Date(), formData.email]);
        break;
      case 'refer':
        targetSheet = sheet.getSheetByName('Refer a Friend');
        if (!targetSheet) {
          return ContentService.createTextOutput(JSON.stringify({error: 'Refer a Friend sheet not found'})).setMimeType(ContentService.MimeType.JSON);
        }
        targetSheet.appendRow([
          new Date(),
          formData.firstName,
          formData.lastName,
          formData.city,
          formData.phone,
          formData.email,
          formData.preferredContact
        ]);
        break;
      case 'buy':
        targetSheet = sheet.getSheetByName('Buy a Bike');
        if (!targetSheet) {
          return ContentService.createTextOutput(JSON.stringify({error: 'Buy a Bike sheet not found'})).setMimeType(ContentService.MimeType.JSON);
        }
        targetSheet.appendRow([
          new Date(),
          formData.firstName,
          formData.lastName,
          formData.city,
          formData.phone,
          formData.email,
          formData.model || '',
          formData.preferredContact
        ]);
        break;
      case 'rent':
        targetSheet = sheet.getSheetByName('Rent a Bike');
        if (!targetSheet) {
          return ContentService.createTextOutput(JSON.stringify({error: 'Rent a Bike sheet not found'})).setMimeType(ContentService.MimeType.JSON);
        }
        targetSheet.appendRow([
          new Date(),
          formData.firstName,
          formData.lastName,
          formData.city,
          formData.phone,
          formData.email,
          formData.model || '',
          formData.duration || '',
          formData.preferredContact
        ]);
        break;
      default:
        return ContentService.createTextOutput(JSON.stringify({error: 'Invalid type: ' + type})).setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify({success: true})).setMimeType(ContentService.MimeType.JSON);
  } catch(error) {
    return ContentService.createTextOutput(JSON.stringify({error: error.toString()})).setMimeType(ContentService.MimeType.JSON);
  }
}
```

4. Click **Save** (💾) and give your script a name (e.g., "Pogon Form Handler")

### Step 5: Deploy as Web App

1. Click **Deploy** → **New deployment**
2. Click the gear icon ⚙️ next to "Select type"
3. Choose **Web app**
4. Fill in the deployment settings:
   - **Description**: "Pogon Website Forms Handler"
   - **Execute as**: Me (your email)
   - **Who has access**: Anyone (important!)
5. Click **Deploy**
6. **Copy the Web App URL** - You'll need this!

### Step 6: Authorize the Script

1. When you click Deploy, you may be asked to authorize
2. Click **Authorize access**
3. Choose your Google account
4. Click **Advanced** → **Go to [Your Project Name] (unsafe)**
5. Click **Allow**

### Step 7: Configure Your Website

1. Create a `.env` file in your project root (if it doesn't exist)
2. Add the following line with your Web App URL:

```env
VITE_GOOGLE_SHEETS_WEB_APP_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```

3. Replace `YOUR_SCRIPT_ID` with the actual ID from your Web App URL
4. Restart your development server

## ✅ Testing

1. Fill out a form on your website
2. Check your Google Sheet - you should see a new row with the submitted data
3. Verify the data appears in the correct sheet

## 🔒 Security Notes

- The Web App URL is public - anyone with the URL can submit data
- This is intentional for form submissions
- The script only accepts POST requests with valid JSON
- Consider adding rate limiting or CAPTCHA if you receive spam

## 🐛 Troubleshooting

### Forms not submitting?
- Check browser console for errors
- Verify your `.env` file has the correct variable name: `VITE_GOOGLE_SHEETS_WEB_APP_URL`
- Make sure the Web App is deployed with "Anyone" access
- Verify sheet names match exactly (case-sensitive)

### Wrong data format?
- Check that column headers match the script
- Verify sheet names match exactly: "Sign Up", "Refer a Friend", "Buy a Bike", "Rent a Bike"

### Script errors?
- Open Apps Script editor and check the Execution log (View → Execution log)
- Test the script manually in the script editor if needed

## 📝 Notes

- The script automatically adds a timestamp to each submission
- Each form type writes to its own sheet for easy organization
- You can add more validation or processing in the Apps Script if needed
