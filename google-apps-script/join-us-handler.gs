// google-apps-script/join-us-handler.gs

// --- Configuration ---
// IMPORTANT: Replace with your actual Google Sheet ID and the sheet name
const SPREADSHEET_ID = 'YOUR_GOOGLE_SHEET_ID_PLACEHOLDER';
const SHEET_NAME = 'JoinUsData'; // Or your preferred sheet name

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
    // This matches the Base64 placeholder "encryption" in the Cloudflare worker
    // Replace with actual decryption logic if real encryption is implemented.
    let decodedData;
    try {
      decodedData = JSON.parse(Utilities.newBlob(Utilities.base64Decode(requestPayload.encryptedData)).getDataAsString());
    } catch (err) {
      throw new Error('Failed to decode or parse data: ' + err.message);
    }

    // --- 3. Basic Malicious Content Check (Placeholder) ---
    // This is a very simplistic check. Real malicious content detection is complex.
    for (const key in decodedData) {
      if (typeof decodedData[key] === 'string' && /<script|<iframe|<onerror/i.test(decodedData[key])) {
        throw new Error('Potential malicious content detected in field: ' + key);
      }
    }

    // --- 4. Prepare Data for Sheet ---
    // Ensure order of headers matches your sheet, or write headers if sheet is new
    const headers = ['Timestamp', 'Name', 'Email', 'Contact', 'Date', 'Time', 'Comment'];
    const dataRow = [
      decodedData.submissionTimestamp || new Date().toISOString(), // Timestamp from worker or new one
      decodedData.name || '',
      decodedData.email || '',
      decodedData.contact || '',
      decodedData.date || '',
      decodedData.time || '',
      decodedData.comment || ''
    ];

    // --- 5. Append Data to Google Sheet ---
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = spreadsheet.getSheetByName(SHEET_NAME);

    if (!sheet) {
      sheet = spreadsheet.insertSheet(SHEET_NAME);
      sheet.appendRow(headers); // Add headers if new sheet
    }

    // Check if headers exist if sheet is not new
    if (sheet.getLastRow() === 0) {
        sheet.appendRow(headers);
    }


    sheet.appendRow(dataRow);

    response.success = true;
    response.message = 'Data successfully recorded in Google Sheet.';

  } catch (error) {
    console.error('Error in Join Us Apps Script: ' + error.toString());
    response.message = 'Error processing request: ' + error.toString();
    // Potentially log more details for debugging if needed, e.g., e.postData.contents
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
    const headers = ['Timestamp', 'Name', 'Email', 'Contact', 'Date', 'Time', 'Comment'];
    sheet.appendRow(headers);
    Logger.log('Sheet created and headers added.');
  } else {
    Logger.log('Sheet already exists.');
  }
}
