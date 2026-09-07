-- Schema for alcove-tracker-db
-- Run this in the D1 console

CREATE TABLE IF NOT EXISTS clients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  company TEXT,
  email TEXT,
  phone TEXT,
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS candidates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  position TEXT,
  client_id INTEGER,
  status TEXT DEFAULT 'new',
  resume_key TEXT,
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (client_id) REFERENCES clients(id)
);

CREATE TABLE IF NOT EXISTS candidate_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  candidate_id INTEGER NOT NULL,
  status TEXT NOT NULL,
  note TEXT,
  changed_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (candidate_id) REFERENCES candidates(id)
);
