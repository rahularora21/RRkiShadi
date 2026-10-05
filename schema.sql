-- Run once in your Cloudflare D1 database console before accepting RSVPs.
CREATE TABLE IF NOT EXISTS rsvps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  attending TEXT,
  events TEXT,
  party_size INTEGER NOT NULL DEFAULT 1,
  rooms TEXT,
  travel_mode TEXT,
  arrival TEXT,
  departure TEXT,
  dietary TEXT,
  song TEXT,
  notes TEXT
);
