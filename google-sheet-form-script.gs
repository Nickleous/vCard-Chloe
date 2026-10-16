/**
 * Bloom Homes website contact form -> Google Sheet
 * Sheet: "Bloom Homes Website Messages", tab "Messages"
 *
 * Setup (one time):
 * 1. Open the sheet. Click Extensions > Apps Script.
 * 2. Delete the sample code, paste this whole file, click Save.
 * 3. Click Deploy > New deployment. Gear icon > Web app.
 *    Execute as: Me.  Who has access: Anyone.  Click Deploy.
 * 4. Approve the permissions Google asks for.
 * 5. Copy the Web app URL (ends in /exec) and send it to Claude.
 */

const SHEET_NAME = 'Messages';
const NOTIFY_EMAIL = 'Nick@BloomHomesAssistedLiving.com';

function doPost(e) {
  const p = (e && e.parameter) || {};

  // Spam trap: real visitors never fill the hidden "website" field.
  if (p.website) return reply_('ok');

  const name = clean_(p.fullname, 200);
  const email = clean_(p.email, 200);
  const message = clean_(p.message, 5000);
  if (!name || !email || !message) return reply_('missing fields');

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  sheet.appendRow([new Date(), name, email, message]);

  MailApp.sendEmail({
    to: NOTIFY_EMAIL,
    replyTo: email,
    subject: 'New website message from ' + name,
    body: 'Name: ' + name + '\nEmail: ' + email + '\n\n' + message +
          '\n\nSaved in the "Bloom Homes Website Messages" Google Sheet.'
  });

  return reply_('ok');
}

// Trim, cap length, and stop text from running as a spreadsheet formula.
function clean_(value, max) {
  let v = String(value || '').trim().slice(0, max);
  if (/^[=+\-@]/.test(v)) v = "'" + v;
  return v;
}

function reply_(text) {
  return ContentService.createTextOutput(text);
}
