// google-apps-script/contact-us-handler.gs

// --- Configuration ---
// IMPORTANT: Replace with your actual Google Sheet ID and the sheet name
const SPREADSHEET_ID = 'YOUR_GOOGLE_SHEET_ID_PLACEHOLDER'; // Can be the same or different from Join Us
const SHEET_NAME = 'ContactUsData'; // Or your preferred sheet name

function doPost(e) {
  let response = { success: false, message: '' };

  try {
    // --- 1. Parse Incoming Data ---
    if (!e.postData || !e.postData.contents) {
      throw new Error('No data received.');
    }
    const requestPayload = JSON.parse(e.postData.contents);

    if (!requestPayload.encryptedData) {
      throw new Error('Missing encryptedData field.');
    }

    // --- 2. "Decrypt" Data ---
    let decodedData;
    try {
      decodedData = JSON.parse(Utilities.newBlob(Utilities.base64Decode(requestPayload.encryptedData)).getDataAsString());
    } catch (err) {
      throw new Error('Failed to decode or parse data: ' + err.message);
    }

    // --- 3. Basic Malicious Content Check (Placeholder) ---
    for (const key in decodedData) {
      if (typeof decodedData[key] === 'string' && /<script|<iframe|<onerror/i.test(decodedData[key])) {
        throw new Error('Potential malicious content detected in field: ' + key);
      }
    }

    // --- 4. Prepare Data for Sheet ---
    const headers = ['Timestamp', 'Name', 'Email', 'Contact Number', 'Preferred Date', 'Preferred Time', 'Comments'];
    const dataRow = [
      decodedData.submissionTimestamp || new Date().toISOString(),
      decodedData.name || '',
      decodedData.email || '',
      decodedData.contactNumber || '',
      decodedData.preferredDate || '',
      decodedData.preferredTime || '',
      decodedData.comments || ''
    ];

    // --- 5. Append Data to Google Sheet ---
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = spreadsheet.getSheetByName(SHEET_NAME);

    if (!sheet) {
      sheet = spreadsheet.insertSheet(SHEET_NAME);
      sheet.appendRow(headers); // Add headers if new sheet
    }

    if (sheet.getLastRow() === 0) {
        sheet.appendRow(headers);
    }

    sheet.appendRow(dataRow);

    response.success = true;
    response.message = 'Data successfully recorded in Google Sheet.';

  } catch (error) {
    console.error('Error in Contact Us Apps Script: ' + error.toString());
    response.message = 'Error processing request: ' + error.toString();
  }

  // --- 6. Return JSON Response ---
  return ContentService.createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

// Function to test or set up the sheet initially (run manually from Apps Script editor)
function setupSheet() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
    const headers = ['Timestamp', 'Name', 'Email', 'Contact Number', 'Preferred Date', 'Preferred Time', 'Comments'];
    sheet.appendRow(headers);
    Logger.log('Sheet created and headers added.');
  } else {
    Logger.log('Sheet already exists.');
  }
}
