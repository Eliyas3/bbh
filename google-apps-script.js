/**
 * BLOOM BOUQUET HUB - PREMIUM BACKEND GOOGLE APPS SCRIPT
 * 
 * This script serves as the serverless API backend for your bouquet booking form.
 * It does the following:
 * 1. Receives form submissions securely via POST requests.
 * 2. Parses customer details (Name, Phone, Occasion, Colors, Budget, Delivery Date, Address, etc.).
 * 3. Handles base64 uploaded inspiration images by saving them directly to Google Drive,
 *    creating a clickable shareable link, and inserting that link directly into the Sheet.
 * 4. Appends all data as a structured row in Google Sheets.
 * 5. Returns a robust JSON response back to the website.
 */

// 1. configuration variables
const SHEET_NAME = 'Bookings'; // The name of the sheet tab
const DRIVE_FOLDER_NAME = 'Bloom Bouquet Hub Inspiration Images'; // Google Drive folder for uploads

/**
 * Handles incoming POST requests from the website form.
 */
function doPost(e) {
  // Set CORS headers for security and preflight options
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400'
  };

  try {
    // Parse the incoming JSON body
    let rawData = e.postData.contents;
    let data = JSON.parse(rawData);
    
    // Open the Google Sheet
    const sheet = getOrCreateSheet();
    
    // Save image to Google Drive if provided and generate clickable URL
    let inspirationImageUrl = 'No image provided';
    if (data.inspirationImageBase64 && data.inspirationImageBase64.trim() !== '') {
      try {
        inspirationImageUrl = saveImageToDrive(
          data.inspirationImageBase64, 
          data.inspirationImageName || 'inspiration_' + Date.now() + '.png'
        );
      } catch (imgError) {
        inspirationImageUrl = 'Error saving image: ' + imgError.toString();
      }
    }
    
    // Append the row to Google Sheets
    // Columns mapping:
    // 1. Timestamp | 2. Name | 3. Phone | 4. Occasion | 5. Bouquet Type | 6. Colors | 7. Budget | 8. Delivery Date | 9. Address | 10. Special Notes | 11. Inspiration Image Link
    sheet.appendRow([
      data.timestamp || new Date().toLocaleString(),
      data.customerName || '',
      data.phoneNumber || '',
      data.occasion || '',
      data.bouquetType || '',
      data.preferredColors || '',
      data.budget || '',
      data.deliveryDate || '',
      data.deliveryAddress || '',
      data.specialNotes || '',
      inspirationImageUrl
    ]);
    
    // Return success response
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: 'Booking successfully logged to Bloom Bouquet Hub.'
    }))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders(headers);
    
  } catch (error) {
    Logger.log('Error in doPost: ' + error.toString());
    
    // Return error response
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    }))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders(headers);
  }
}

/**
 * Handles OPTIONS requests for preflight checks (CORS compliance)
 */
function doOptions(e) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400'
  };
  
  return ContentService.createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeaders(headers);
}

/**
 * Helper: Opens or initializes the Sheet with clean headers
 */
function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  
  // If the sheet tab doesn't exist, create it and set up column headers
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    const headers = [
      'Timestamp',
      'Customer Name',
      'Phone Number',
      'Occasion',
      'Bouquet Type',
      'Preferred Colors',
      'Budget',
      'Delivery Date',
      'Address',
      'Special Notes',
      'Inspiration Image URL'
    ];
    
    // Write headers
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    
    // Format headers to look premium (bold, background color, center aligned)
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#FFF0F2'); // Soft pastel pink matches our brand
    headerRange.setFontColor('#4A3B32');   // Elegant deep warm gray
    headerRange.setHorizontalAlignment('center');
    
    // Auto-fit column widths
    for (let i = 1; i <= headers.length; i++) {
      sheet.autoResizeColumn(i);
    }
  }
  
  return sheet;
}

/**
 * Helper: Decodes base64 string, saves it to Drive, and returns shareable URL
 */
function saveImageToDrive(base64Data, filename) {
  // Find or create the dedicated upload folder in Google Drive
  let folder;
  const folders = DriveApp.getFoldersByName(DRIVE_FOLDER_NAME);
  
  if (folders.hasNext()) {
    folder = folders.next();
  } else {
    folder = DriveApp.createFolder(DRIVE_FOLDER_NAME);
  }
  
  // Split metadata header from actual base64 content
  // Example base64Data: "data:image/png;base64,iVBORw0KGgoAAAANS..."
  const base64Parts = base64Data.split(',');
  const contentType = base64Parts[0].split(':')[1].split(';')[0];
  const decodedData = Utilities.base64Decode(base64Parts[1]);
  
  // Create blob and save file in Google Drive
  const blob = Utilities.newBlob(decodedData, contentType, filename);
  const file = folder.createFile(blob);
  
  // Set file viewing permissions to anyone with link (essential for order managers)
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  
  // Return the clickable web share link
  return file.getUrl();
}
