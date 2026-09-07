# AlcoveHire SaaS: Production Deployment Checklist (GoDaddy DNS + Render)

## Chosen Host Stack

- Frontend and Marketing: Render Static Sites
- Backend API and Workers: Render Web Service + Background Worker
- Database: Render PostgreSQL (or Neon Postgres if preferred)
- Cache/Queue: Render Redis
- File Storage: AWS S3 (or Cloudflare R2)
- Optional edge security: Cloudflare in front of all subdomains

## 1) Domain and Subdomain Plan

Use existing domain from GoDaddy:
- `alcoveinfotech.com` -> company landing site
- `alcovehire.alcoveinfotech.com` -> marketing site
- `app.alcoveinfotech.com` -> SaaS application
- `api.alcoveinfotech.com` -> backend API

Optional:
- `status.alcoveinfotech.com` -> status page
- `docs.alcoveinfotech.com` -> product docs

## 2) Pre-Deployment Setup

- Create production accounts: Render, payment provider, email provider, S3, monitoring.
- Create separate projects for `staging` and `production`.
- Add secret manager values for all environment variables.
- Enable branch protection and CI checks before production deploy.
- Prepare rollback strategy (previous stable image or commit).

## 3) GoDaddy DNS Configuration Steps

1. Login to GoDaddy Domain Control Center.
2. Open DNS Management for `alcoveinfotech.com`.
3. Add records:
   - `CNAME` `alcovehire` -> target from Render static site.
   - `CNAME` `app` -> target from Render static app.
   - `CNAME` `api` -> target from Render API service.
4. TTL: 600 seconds during setup, then 1 hour.
5. Remove conflicting old A/CNAME records for same hostnames.
6. Wait for propagation and validate with DNS checker.

## 4) Render Service Setup

### 4.1 Marketing Site
- Build command: static site build (if needed).
- Publish directory: site output folder.
- Custom domain: `alcovehire.alcoveinfotech.com`.

### 4.2 App Frontend
- Build command: app frontend build.
- Environment variable: `VITE_API_BASE_URL=https://api.alcoveinfotech.com` (or framework equivalent).
- Custom domain: `app.alcoveinfotech.com`.

### 4.3 API Service
- Runtime: Node.js LTS.
- Health check endpoint: `/health`.
- Autoscaling: minimum 1 instance, scale by CPU and request latency.
- Custom domain: `api.alcoveinfotech.com`.

### 4.4 Worker Service
- Run background jobs for emails, reminders, webhook retries, and report generation.
- Ensure worker uses same code version and environment variables as API.

### 4.5 Databases
- Provision Postgres and Redis.
- Restrict network access to Render services only.
- Enable automated backups.

## 5) SSL Certificate Steps

- Render issues managed SSL certificates for connected domains.
- Verify certificate status for all subdomains in Render dashboard.
- Force HTTPS redirect.
- Set HSTS header after confirming all routes work via HTTPS.

## 6) Application Security Hardening

- Enable secure headers: CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy.
- Enable API rate limiting and brute-force guard on auth endpoints.
- Enforce strong password policy and session expiry.
- Store secrets only in Render environment settings, never in repo.
- Restrict CORS to known app domains only.

## 7) Payment and Billing Production Checklist

- Switch to live API keys for Stripe or Razorpay.
- Set live webhook endpoints:
  - `https://api.alcoveinfotech.com/webhooks/stripe`
  - `https://api.alcoveinfotech.com/webhooks/razorpay`
- Verify webhook signature validation.
- Implement idempotency for duplicate webhook delivery.
- Test cases:
  - successful checkout
  - failed payment
  - renewal
  - plan upgrade
  - cancellation

## 8) Email and Notifications Checklist

- Verify SPF, DKIM, and DMARC records in GoDaddy DNS.
- Configure transactional email templates:
  - welcome
  - trial ending
  - payment receipt
  - payment failed
  - password reset
- Add bounce and complaint webhook handling.

## 9) Data Protection and Legal Checklist

- Publish Terms of Service and Privacy Policy.
- Add Refund/Cancellation policy.
- Add Data Processing Addendum for B2B customers.
- Define retention policy and account deletion workflow.
- Maintain subprocessors list (hosting, email, payments, analytics).

## 10) Observability and Operations

- Add centralized logs (structured JSON logs).
- Add error tracking (Sentry or equivalent).
- Add uptime monitoring on:
  - marketing domain
  - app domain
  - API health endpoint
- Configure alerts to email/Slack for 5xx spikes and downtime.

## 11) Backup and Disaster Recovery

- Postgres backups daily with 30-day retention.
- Verify restore to staging once per month.
- Store backup and restore runbook in team docs.
- Define RPO and RTO targets:
  - RPO: <= 24 hours
  - RTO: <= 4 hours

## 12) Go-Live Runbook

1. Freeze production changes.
2. Run migration on production database.
3. Deploy API, worker, and frontend.
4. Verify health checks and smoke tests.
5. Verify billing webhook events in real time.
6. Validate SSL and security headers.
7. Turn on marketing signup and public pricing page.
8. Monitor first 24 hours with high alert sensitivity.

## 13) Post-Launch (First 30 Days)

- Track funnel metrics: visit -> trial signup -> activation -> paid conversion.
- Track product metrics: daily active recruiters, candidates added, AI credit usage.
- Track finance metrics: MRR, churn, failed payments, recovery rate.
- Run weekly incident review and roadmap adjustment.
