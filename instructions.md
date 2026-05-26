# Google Sheets & Apps Script Setup Guide - Bloom Bouquet Hub

Welcome! This guide will walk you through setting up a secure, serverless database using Google Sheets and Google Drive in less than 3 minutes. 

Once configured, customers who fill out the inquiry form on your website will have their bookings saved in real time, and any inspiration images uploaded will automatically save as files in a dedicated Google Drive folder, with clickable links generated in your sheet!

---

## Step 1: Create Your Google Sheet
1. Open Google Sheets ([sheets.google.com](https://sheets.google.com)) and create a **Blank Spreadsheet**.
2. Rename the spreadsheet to something memorable, like **"Bloom Bouquet Hub - Customer Bookings"**.
3. (Optional) Name the first tab/sheet as **"Bookings"** (or let the script create it for you automatically!).

---

## Step 2: Open Google Apps Script
1. In the top menu of your Google Sheet, click on **Extensions** -> **Apps Script**.
2. This will open a new browser window/editor named "Untitled project".
3. Rename the Apps Script project to **"Bloom Bouquet Hub Backend"**.

---

## Step 3: Paste the Backend Code
1. In your local workspace, open the file [google-apps-script.js](file:///c:/Users/Dell/OneDrive/Desktop/BBH/google-apps-script.js).
2. Copy the entire contents of that file.
3. Return to the Apps Script browser window, delete any default code inside the editor (`Code.gs`), and paste the copied code there.
4. Click the **Save** icon (disk icon) or press `Ctrl + S` (`Cmd + S` on Mac).

---

## Step 4: Deploy the Script as a Web App (Crucial Step)
To allow your website's form to send data, you must deploy the script as a public Web App:
1. In the top-right corner of the Apps Script window, click the blue **Deploy** button and select **New deployment**.
2. In the modal that appears, click the gear icon next to "Select type" and choose **Web app**.
3. Fill out the configuration details exactly as follows:
   * **Description**: `Bloom Bouquet Hub Booking API v1`
   * **Execute as**: Select **"Me (your-email@gmail.com)"**. This ensures the script uses *your* authorization to write to the sheet and save files to your Google Drive.
   * **Who has access**: Select **"Anyone"**. *(Important: Do not select "Only myself" or "Anyone with a Google account" as this will block submissions from your website guests).*
4. Click the **Deploy** button.

---

## Step 5: Authorize Google Permissions
1. Since the script reads/writes sheets and saves files to Google Drive, Google will ask for permission. Click **Authorize Access**.
2. Select your Google account.
3. You will see a warning screen saying *"Google hasn't verified this app"*. 
   * This is normal for custom, private Apps Scripts. 
   * Click **Advanced** at the bottom, and then click **Go to Bloom Bouquet Hub Backend (unsafe)**.
4. Review the requested permissions (access to Google Sheets & Google Drive files) and click **Allow**.

---

## Step 6: Integrate the URL into Your Website
1. Once the deployment finishes, Google will display a modal containing a **Web app URL**. It will look similar to this:
   `https://script.google.com/macros/s/AKfycb.../exec`
2. Click **Copy** to copy this URL.
3. Open your local website code file: [script.js](file:///c:/Users/Dell/OneDrive/Desktop/BBH/script.js).
4. Locate **Line 333** (or search for `GOOGLE_APPS_SCRIPT_URL`).
5. Replace the placeholder URL with your newly copied Google Web App URL:
   ```javascript
   const GOOGLE_APPS_SCRIPT_URL = 'PASTE_YOUR_COPIED_URL_HERE';
   ```
6. Save [script.js](file:///c:/Users/Dell/OneDrive/Desktop/BBH/script.js)!

---

## Step 7: Test Your Integration!
1. Double-click `index.html` to open your beautiful website in a browser.
2. Scroll down to the **Custom Bouquet Booking** form.
3. Fill out the fields with test details (e.g., Jane Doe, 123-456-7890, Pastel Pink & Gold roses, $80 budget, select a future delivery date, upload a test image).
4. Click **Book Your Bouquet**.
5. Watch the premium loading animation, followed by the lovely popup saying: *"Your bouquet booking has been received 🌸"*.
6. Open your Google Sheet—you will instantly see a new row automatically created, formatted beautifully with headers, all customer inputs, and a **clickable Google Drive link** leading directly to your uploaded test image!

---

## Order Management Features Included:
* **Dedicated Google Drive Folder**: A folder named **"Bloom Bouquet Hub Inspiration Images"** is automatically created on your Google Drive. All uploaded photos are placed there with permissions set so you or any authorized manager can click the links inside the sheet to instantly inspect the reference.
* **Auto-Initialization**: If you accidentally delete your sheet tab or columns, the Apps Script will automatically rebuild the "Bookings" sheet on the next submission, setting up the elegant pink headers and columns in real time.
