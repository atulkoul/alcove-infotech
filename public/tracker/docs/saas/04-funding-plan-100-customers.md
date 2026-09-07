# AlcoveHire Funding Plan (100 Customers Target)

## Executive Summary

- Goal: make AlcoveHire production-ready in 3 to 4 months, then start sales and scale to first 100 paying customers.
- Funding ask recommended: INR 2.2 Cr for 12-month runway.
- Build period: 4 months.
- Sales ramp period: months 5 to 12.
- Break-even path: after 100+ customers and controlled hiring.

## Assumptions Used for Budget

- Currency: INR.
- Team location: India metro mix (mid-market salary bands).
- Pricing model used:
  - Starter: INR 2,999/month
  - Growth: INR 7,999/month
  - Business: INR 18,999/month
- Customer mix at 100 customers:
  - 60 Starter
  - 30 Growth
  - 10 Business
- Expected MRR at 100 customers: INR 6,09,900.
- Expected ARR at 100 customers: INR 73,18,800.

## 1) Application Ready Locally (Month 1)

Objective: make the product fully runnable and testable on local machines before cloud deployment.

Deliverables:
- Local backend API with PostgreSQL and Redis using docker-compose.
- Local auth and role-based access.
- Local multi-tenant data model wired to all modules.
- Local billing sandbox integration (Stripe or Razorpay test mode).
- Local AI credit engine with wallet and ledger.
- Smoke tests and QA checklist for all major flows.

Definition of Done:
- Any developer can clone repo and run full app in less than 30 minutes.
- Seed data scripts create one demo tenant and users.
- No critical security issues in local security checklist.

## 2) Final Budget (Monthly and Yearly)

## 2.1 Team Plan and Salary Budget

Recommended team for 3 to 4 month build and immediate selling:

Product and Engineering:
- 1 Product Manager: INR 1,50,000/month
- 2 Frontend Developers: INR 90,000 each/month = INR 1,80,000/month
- 2 Backend Developers: INR 1,20,000 each/month = INR 2,40,000/month
- 1 QA Engineer: INR 60,000/month
- 1 DevOps and Security Engineer: INR 1,20,000/month
- 1 UI/UX Designer: INR 70,000/month

Go-to-market and Support:
- 1 Sales Lead: INR 1,20,000/month
- 2 Sales Executives: INR 50,000 each/month = INR 1,00,000/month
- 1 Customer Success Executive: INR 55,000/month
- 1 Performance Marketer: INR 70,000/month

Total fixed salaries per month:
- INR 11,65,000

Benefits and overhead load (PF, gratuity, tools, hiring overhead) at 18 percent:
- INR 2,09,700/month

Total people cost per month:
- INR 13,74,700

Total people cost per year:
- INR 1,64,96,400

## 2.2 Infra and Platform Cost (100 Customers Target)

Monthly:
- Frontend hosting (Render static + CDN): INR 2,500
- Backend API services: INR 18,000
- Background workers: INR 10,000
- Managed PostgreSQL: INR 20,000
- Redis: INR 7,000
- Object storage and bandwidth: INR 8,000
- Email provider: INR 6,000
- Monitoring and logs: INR 8,000
- Backup and DR tooling: INR 5,000
- WAF/CDN security (Cloudflare paid features): INR 6,000
- SSL: INR 0 (managed SSL)

Total infra cost per month:
- INR 90,500

Total infra cost per year:
- INR 10,86,000

## 2.3 Business and Compliance Costs

Monthly:
- Accounting and GST tooling: INR 5,000
- Legal retainer amortized: INR 20,000
- Contract and e-sign tools: INR 3,000
- CRM and sales stack: INR 15,000
- Communication tools (email/chat/meet): INR 7,000

Total business ops per month:
- INR 50,000

Total business ops per year:
- INR 6,00,000

One-time or annual fixed costs:
- Domain renewal (existing): INR 1,500/year
- Optional new product domain: INR 2,500/year
- Legal docs drafting package (one-time): INR 50,000
- Security audit and basic pentest (one-time): INR 2,00,000

## 2.4 Sales and Marketing Spend

Monthly paid demand generation budget:
- Ads and outbound tools: INR 2,00,000/month

Sales incentives and travel (monthly average):
- INR 75,000/month

Total growth spend per month:
- INR 2,75,000

Total growth spend per year:
- INR 33,00,000

## 2.5 Grand Totals

Monthly operating burn after launch:
- People: INR 13,74,700
- Infra: INR 90,500
- Business ops: INR 50,000
- Sales and marketing: INR 2,75,000
- Total: INR 17,90,200 per month

Annual operating burn:
- INR 2,14,82,400

One-time setup and risk reserve:
- Legal setup + security audit + misc setup: INR 3,00,000
- Contingency reserve (10 percent of annual burn): INR 21,48,240

Recommended funding raise target:
- INR 2.2 Cr

## 3) Full Business Plan for Funding Pitch

## 3.1 Problem Statement

- Recruiting agencies and hiring teams lose time in fragmented spreadsheets, manual follow-ups, and poor pipeline visibility.
- Existing tools are expensive or too complex for small and mid-sized agencies.

## 3.2 Solution Positioning

- AlcoveHire is an AI-powered recruitment operating platform for agencies and growing HR teams.
- Core value:
  - Faster shortlist turnaround
  - Better recruiter productivity
  - Higher placement conversion
  - Predictable revenue with process visibility

## 3.3 Revenue Model

- Subscription SaaS: monthly and yearly plans.
- AI credits for premium actions.
- Upsell path:
  - extra seats
  - additional AI credits
  - enterprise onboarding and support

## 3.4 Go-to-Market Strategy

- Beachhead market:
  - staffing and recruitment agencies with 5 to 50 recruiters
  - in-house TA teams in IT services and startups
- Motion:
  - founder-led sales for first 20 accounts
  - outbound + webinars + partner referrals for next 80 accounts

## 3.5 Key Metrics Investors Expect

- CAC (customer acquisition cost)
- MRR growth rate
- Trial-to-paid conversion
- Gross margin
- Net revenue retention
- Churn rate
- Payback period on sales spend

## 3.6 12-Month Targets

- 100 paying customers
- MRR about INR 6.1L (base case)
- Trial-to-paid conversion above 15 percent
- Gross churn below 3.5 percent monthly

## 4) Whom and How to Target for Funding

Who to target first:
- Angel investors with SaaS or HRTech background.
- Micro VCs investing in B2B SaaS pre-seed and seed.
- Strategic operators from recruitment or HR software space.

Suggested stages:
- Stage 1: friends, family, and operators for early validation capital.
- Stage 2: angel syndicate for pre-seed round.
- Stage 3: micro VC seed round after first revenue traction.

What to show in pitch:
- Working product demo.
- 10 to 20 design partners or pilot customers.
- Clear pricing and unit economics.
- 12-month execution plan with hiring and budget.
- Evidence of demand: LOIs, pilot MoUs, paid pilots.

Funding materials checklist:
- Pitch deck (12 to 15 slides)
- Financial model (36 months)
- Product roadmap and architecture
- Customer pipeline and GTM plan
- Founder and team profile

## 5) Tentative Cost and Timeline to Commit Delivery

## Month-by-month timeline (4-month build)

Month 1:
- Local app stabilization.
- Backend and tenant architecture finalized.
- Auth and role model done.

Month 2:
- Core modules integrated with API and database.
- Billing sandbox and credits model integrated.
- QA automation baseline.

Month 3:
- Security hardening, audit logs, backups.
- Production deployment on staging.
- Early pilot onboarding with 5 to 10 customers.

Month 4:
- Bug fixes from pilots.
- Production launch readiness.
- Pricing page, legal pages, onboarding, support SOP.

Launch commitment:
- Product ready to sell by end of month 4.

Estimated spend during build phase (4 months):
- Average monthly burn during build (smaller sales spend): INR 14,50,000
- 4-month build spend: INR 58,00,000

## 6) Sales Team Plan After Funding

When to hire:
- Hire core sales in month 3 so pipeline is ready at launch.

Team structure:
- 1 Sales Lead (inbound/outbound strategy and closing)
- 2 Sales Executives (prospecting, demos, follow-ups)
- 1 Customer Success (onboarding and retention)
- 1 Performance Marketer (lead generation)

How they will sell:
- Outbound list building and email cadence for agencies.
- Weekly webinar demos.
- 14-day trial and guided onboarding.
- Use case based sales scripts by segment.
- Referral incentives for existing customers and partners.

Sales funnel targets per month:
- 1,000 outbound contacts
- 150 discovery calls
- 60 product demos
- 20 trial signups
- 8 to 12 paid conversions

## 7) Funding Use of Proceeds (INR 2.2 Cr)

- Product and engineering: 52 percent
- Sales and marketing: 28 percent
- Cloud and operations: 8 percent
- Legal and compliance: 2 percent
- Contingency and buffer: 10 percent

## 8) Risks and Mitigation

Top risks:
- Slow conversion from trial to paid.
- Underestimated infra and AI cost at scale.
- Delays in hiring quality engineers.

Mitigation:
- Start with paid pilot customers early.
- Track cost per AI action from day one.
- Keep hiring pipeline warm and use contractors if needed.

## 9) Investor Narrative (Short)

- Problem is frequent and painful.
- Product is vertical SaaS with AI leverage.
- Pricing is clear and scalable.
- Team plan and timeline are realistic.
- Funding ask is tied to execution milestones and measurable outcomes.

## 10) Decision You Should Lock This Week

- Choose payment provider (Razorpay first if India-first).
- Confirm hosting stack (Render + Cloudflare baseline).
- Freeze feature scope for month 1 to month 4 roadmap.
- Start hiring 2 backend and 2 frontend engineers immediately.
