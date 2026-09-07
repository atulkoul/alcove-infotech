# Alcove Infotech — Website + Candidate Tracker

## Structure
```
├── wrangler.toml          # Worker config (D1, R2 bindings, custom domain)
├── src/
│   ├── index.js           # Worker entry — routing + tracker API
│   └── excel.js           # Excel export utility
├── public/
│   ├── main-website/      # Main website pages (www.alcoveinfotech.com)
│   └── tracker/            # Candidate tracker UI (www.alcoveinfotech.com/tracker)
├── schema.sql             # D1 database schema
└── package.json
```

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Create D1 database tables
Run the SQL from `schema.sql` in the D1 console:
https://dash.cloudflare.com/39eb766273d09fa8df4195363e8a6ab4/workers/d1/databases/89c96f5e-c1ac-4d2b-8a82-2edbcaa427cc/console

### 3. Deploy
```bash
npx wrangler deploy
```

## Features
- **Main website** at `www.alcoveinfotech.com` — static site served from Worker
- **Candidate tracker** at `www.alcoveinfotech.com/tracker` — full CRUD app
  - Manage clients (add, edit, delete)
  - Manage candidates (add, edit, delete, status tracking)
  - Resume upload to R2 bucket
  - Resume download
  - Export candidates to Excel
  - Dashboard stats
- **Apex redirect** — `alcoveinfotech.com` → `www.alcoveinfotech.com` (301)

## API Routes
| Method | Path | Description |
|--------|------|-------------|
| GET | /tracker/api/stats | Dashboard statistics |
| GET | /tracker/api/clients | List all clients |
| POST | /tracker/api/clients | Create client |
| PUT | /tracker/api/clients/:id | Update client |
| DELETE | /tracker/api/clients/:id | Delete client |
| GET | /tracker/api/candidates | List all candidates |
| POST | /tracker/api/candidates | Create candidate (with resume upload) |
| PUT | /tracker/api/candidates/:id | Update candidate |
| DELETE | /tracker/api/candidates/:id | Delete candidate (+ resume) |
| GET | /tracker/api/candidates/:id/resume | Download resume |
| GET | /tracker/api/candidates/:id/history | Status history |
| GET | /tracker/api/export/excel | Export candidates to Excel |

## Storage
- **D1 database** `alcove-tracker-db` — clients, candidates, history
- **R2 bucket** `alcove-resumes` — resume file storage
