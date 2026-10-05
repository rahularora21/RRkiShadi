/* Bound to the private RSVP Google Sheet. Set API_URL and ADMIN_KEY in
 * Project Settings > Script properties, then run setupRsvpSync once. */
const RSVP_COLUMNS = ['id', 'created_at', 'full_name', 'phone', 'phone_country', 'attending', 'events', 'party_size', 'rooms', 'extra_bedding', 'travel_mode', 'arrival', 'departure', 'dietary', 'song', 'notes', 'email_sent_at'];
const RSVP_EMAIL = 'rahul@exsearch.in';

function setupRsvpSync() {
  const props = PropertiesService.getScriptProperties();
  const book = SpreadsheetApp.getActiveSpreadsheet();
  props.setProperty('SPREADSHEET_ID', book.getId());
  if (!props.getProperty('API_URL') || !props.getProperty('ADMIN_KEY')) throw new Error('Set API_URL and ADMIN_KEY in Script properties first.');
  syncRsvps();
  if (!ScriptApp.getProjectTriggers().some(t => t.getHandlerFunction() === 'syncRsvps')) {
    ScriptApp.newTrigger('syncRsvps').timeBased().everyMinutes(1).create();
  }
}

function syncRsvps() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(1000)) return;
  try {
    const props = PropertiesService.getScriptProperties();
    const apiUrl = props.getProperty('API_URL');
    if (!/^https:\/\/[^/]+\/api\/rsvp$/.test(apiUrl || '')) throw new Error('API_URL must be your HTTPS /api/rsvp address.');
    const book = SpreadsheetApp.openById(props.getProperty('SPREADSHEET_ID'));
    const sheet = book.getSheetByName('RSVPs');
    if (!sheet) throw new Error('Missing RSVPs tab.');
    const headers = sheet.getRange(1, 1, 1, RSVP_COLUMNS.length).getValues()[0];
    if (headers.join('|') !== RSVP_COLUMNS.join('|')) throw new Error('RSVP column headers changed. Restore them before syncing.');
    const lastRow = sheet.getLastRow();
    const existing = lastRow > 1 ? sheet.getRange(2, 1, lastRow - 1, RSVP_COLUMNS.length).getValues() : [];
    const ids = new Set(existing.map(r => Number(r[0])));
    const cursor = Number(props.getProperty('LAST_ID') || 0);
    const response = UrlFetchApp.fetch(apiUrl + '?after_id=' + cursor, {
      headers: { Authorization: 'Bearer ' + props.getProperty('ADMIN_KEY') }, muteHttpExceptions: true,
    });
    if (response.getResponseCode() !== 200) throw new Error('RSVP sync failed: HTTP ' + response.getResponseCode());
    const result = JSON.parse(response.getContentText());
    if (!Array.isArray(result.rsvps)) throw new Error('Unexpected RSVP response.');
    for (const rsvp of result.rsvps) {
      if (!ids.has(Number(rsvp.id))) {
        const row = RSVP_COLUMNS.map(c => safeCell_(rsvp[c] == null ? '' : rsvp[c]));
        const next = sheet.getLastRow() + 1;
        sheet.getRange(next, 4, 1, 2).setNumberFormat('@');
        sheet.getRange(next, 1, 1, RSVP_COLUMNS.length).setValues([row]);
        SpreadsheetApp.flush();
        ids.add(Number(rsvp.id));
      }
      props.setProperty('LAST_ID', String(rsvp.id));
    }
    // Retry unsent alerts on later runs if mail quota or delivery temporarily fails.
    const rowCount = sheet.getLastRow() - 1;
    if (rowCount > 0) {
      const rows = sheet.getRange(2, 1, rowCount, RSVP_COLUMNS.length).getValues();
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        if (!row[0] || row[16]) continue;
        if (MailApp.getRemainingDailyQuota() < 1) throw new Error('Email quota exhausted. Alerts will retry later.');
        MailApp.sendEmail({ to: RSVP_EMAIL, subject: 'New wedding RSVP: ' + String(row[2]).replace(/[\r\n]/g, ' '),
          body: 'A new RSVP has arrived.\n\nName: ' + row[2] + '\nAttendance: ' + row[5] + '\nGuests: ' + row[7] + '\nRooms: ' + row[8] + '\nExtra beds: ' + row[9] + '\nArrival: ' + row[11] + '\nDeparture: ' + row[12] + '\n\nView the private response sheet:\n' + book.getUrl(),
          name: 'Ruchi & Rahul RSVP' });
        sheet.getRange(i + 2, 17).setValue(new Date()).setNumberFormat('dd mmm yyyy hh:mm');
        SpreadsheetApp.flush();
      }
    }
  } finally { lock.releaseLock(); }
}

function safeCell_(value) {
  return typeof value === 'string' && /^[\s]*[=+@-]/.test(value) ? "'" + value : value;
}
