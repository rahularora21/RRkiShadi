# RSVP sheet and email alerts

RSVPs are stored first in the `rrkishadi-rsvp` Cloudflare D1 database. Google Apps Script copies new entries into the private `RSVPs` sheet and emails `rahul@exsearch.in`. It checks every minute; Google may delay scheduled runs. The Sheet can be downloaded using **File → Download → Microsoft Excel (.xlsx)**.

## Activate

1. In D1, apply `migrations/0001_rsvp_details.sql` once to the existing database. `schema.sql` is for fresh databases; `CREATE TABLE IF NOT EXISTS` does not update an existing table.
   For transport help fields, also apply `migrations/0002_transport_help.sql` once. The first migration was already applied on 5 October 2026; do not rerun it.
2. Add a strong random **secret** named `ADMIN_KEY` to the production Pages project. Keep it out of GitHub, browser code, and URLs. Publish the updated website after the migration and secret are ready.
3. Open [the response sheet](https://docs.google.com/spreadsheets/d/1Tgiup2qmOWGGdj_9rPb-X9Suawxfo39ErK1EVyGNXFw/edit) → **Extensions → Apps Script**. Replace the starter code with `rsvp-sheets.gs`.
4. Under **Project Settings → Script properties**, set `API_URL` to `https://rrkishadi-2z6.pages.dev/api/rsvp` and `ADMIN_KEY` to the same Cloudflare secret. Set the project timezone to **Asia/Kolkata**.
5. Run `setupRsvpSync` once and authorize spreadsheet access, outgoing HTTPS requests, email sending, and the scheduled trigger in your Google account. Keep the script and sheet private. Don't rename the `RSVPs` tab or its headers.
6. Submit one clearly labelled test RSVP and verify a row appears and an alert reaches `rahul@exsearch.in`. Check Apps Script **Executions** if either fails. Initial setup also imports and sends alerts for any existing responses.

Saved responses survive a Sheets/email failure. Failed emails retry on subsequent runs. A rare interruption immediately after sending email and before marking it sent may produce a duplicate alert. Google daily email quotas apply. Leave response IDs intact; changing or deleting them can cause a missing or duplicate row. The stored `LAST_ID` cursor permits incremental batches of 100 rows.

Travel dates list 14–18 December 2026 with weekdays. Times use 30-minute intervals. Transport help adds pickup origin, optional flight/train number and arrival time, or a required city name. Sheet columns R–U store these fields; the existing email status stays in Q. Existing responses and sync cursor are preserved.

## Private Excel-compatible CSV

`GET /api/rsvp?format=csv` with `Authorization: Bearer <ADMIN_KEY>` downloads all responses. CSV preserves Unicode and escapes text that could be interpreted as formulas. Never put the key into a public link. The existing query-key route remains compatible but the Sheets sync uses a header.
