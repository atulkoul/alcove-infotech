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

CREATE TABLE IF NOT EXISTS tracker_state (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS requirements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  requirement_id TEXT,
  client TEXT,
  position_title TEXT,
  department TEXT,
  location TEXT,
  openings INTEGER DEFAULT 0,
  experience TEXT,
  ctc_budget TEXT,
  notice_period TEXT,
  hiring_manager TEXT,
  jd_link TEXT,
  job_description TEXT,
  priority TEXT DEFAULT 'Medium',
  status TEXT DEFAULT 'Open',
  target_date TEXT,
  recruiter TEXT,
  profiles_submitted INTEGER DEFAULT 0,
  interviews INTEGER DEFAULT 0,
  offers INTEGER DEFAULT 0,
  joinees INTEGER DEFAULT 0,
  comments TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS interviewer_teams (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  team_name TEXT,
  interviewer_name TEXT,
  role TEXT,
  email TEXT,
  phone TEXT,
  department TEXT,
  status TEXT DEFAULT 'Active',
  availability TEXT,
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
