<!-- Deployment Plan for the Keanu Le Roux Financial Advisor Website -->
<!-- Covers pre-deployment checks, Vercel setup, Sanity CMS config, and post-deploy verification -->
<!-- Reference: quality-assurance/bugs.csv for open issues, .kiro/source/post-implementation-requirements.md for backlog -->

# Deployment Plan — Keanu Le Roux Financial Advisor Website

> **Date:** 2026-04-01  
> **Version:** 0.1.0  
> **Stack:** Next.js 16 (App Router), TypeScript, Sanity CMS, Resend  
> **Target Platform:** Vercel

---

## 1. Pre-Deployment Checklist

### 1.1 Local Verification

Run these commands from the project root before deploying:

```bash
# Run all tests (76 tests across 16 files)
./node_modules/.bin/vitest --run

# Production build — must complete with zero errors
./node_modules/.bin/next build

# Smoke test the production build locally
./node_modules/.bin/next start
```

Verify these routes work:
- `/` — Landing page with all 10 sections
- `/blog/why-starting-early` — Placeholder blog post (renders fallback when Sanity isn't configured)
- `/nonexistent-page` — Custom 404 page

### 1.2 Content Dependencies (Client Action Required)

These items need real assets from Keanu before production launch. The site will deploy and function without them, but with placeholder content.

| Item | Current State | What's Needed | File to Update |
|------|--------------|---------------|----------------|
| Sanity CMS | Placeholder credentials | Create Sanity project, get project ID + dataset | `.env` on Vercel |
| Resend API Key | Not set | Sign up at resend.com, get API key | `.env` on Vercel |
| Resend Sender Domain | Uses `onboarding@resend.dev` | Verify custom domain in Resend dashboard | `src/app/api/contact/route.ts` |
| Newsletter URL | `https://newsletter.example.com` | Real signup page URL | `src/data/siteConfig.ts` |
| Partner Logos | `.gitkeep` placeholder | 5 logo images (PNG/SVG, ~160×70px) | `public/images/partners/` |
| Service Images | External Unsplash URLs | 3 local landscape images | `public/images/services/` + `src/data/services.ts` |

---

## 2. Vercel Deployment

### 2.1 Connect Repository

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import the Git repository
3. Vercel auto-detects Next.js — no framework override needed
4. Build settings (auto-detected):
   - Build Command: `next build`
   - Output Directory: `.next`
   - Install Command: `npm install`

### 2.2 Environment Variables

Set these in Vercel Dashboard → Project → Settings → Environment Variables:

| Variable | Required | Notes |
|----------|----------|-------|
| `SANITY_PROJECT_ID` | Yes (for CMS) | From sanity.io/manage — lowercase alphanumeric + hyphens |
| `SANITY_DATASET` | Yes (for CMS) | Usually `production` |
| `SANITY_API_TOKEN` | Optional | Only needed for authenticated/preview queries |
| `RESEND_API_KEY` | Yes (for contact form) | From resend.com dashboard |

**Without Sanity credentials:** The site deploys fine. Blog section shows the placeholder post. Blog detail page renders the fallback for `/blog/why-starting-early`. Other blog slugs return 404.

**Without Resend API key:** The site deploys fine. Contact form submissions will fail silently (500 response from API route). The form UI still works including validation and honeypot.

### 2.3 Deploy

```bash
# Option A: Push to main branch (auto-deploys if Vercel Git integration is connected)
git push origin main

# Option B: Manual deploy via Vercel CLI
npx vercel --prod
```

---

## 3. Sanity CMS Setup

Skip this section if deploying without CMS initially.

### 3.1 Create Sanity Project

```bash
# From the sanity/ directory
npx sanity init --project-plan free

# Or create via sanity.io/manage and note the project ID
```

### 3.2 Configure CORS

In [sanity.io/manage](https://sanity.io/manage) → Project → API → CORS Origins:

- Add your Vercel production URL: `https://your-domain.vercel.app`
- Add `http://localhost:3000` for local development
- Enable "Allow credentials" if using authenticated queries

### 3.3 Deploy Sanity Studio (Optional)

The Sanity Studio can be deployed separately or accessed at sanity.io/manage:

```bash
# From the sanity/ directory
npx sanity deploy
```

### 3.4 Create First Blog Post

In Sanity Studio, create a blog post with:
- Title, slug, published date, excerpt
- Main image (uploaded to Sanity)
- Body content (Portable Text)
- Set `published: true`

The site will pick it up within 60 seconds (ISR revalidation).

---

## 4. Post-Deployment Verification

### 4.1 Smoke Tests

| Test | URL | Expected |
|------|-----|----------|
| Landing page loads | `/` | All 10 sections render, video plays |
| Navigation works | Click each nav link | Smooth scroll to sections |
| Mobile menu | Resize to <768px | Hamburger menu opens/closes |
| Contact form | `/` → Contact section | Form validates, submits (if Resend configured) |
| Blog fallback | `/blog/why-starting-early` | Placeholder post renders |
| 404 page | `/anything-random` | Custom 404 with back link |
| Favicon | Browser tab | "KL" navy SVG icon |

### 4.2 Performance

- Run [PageSpeed Insights](https://pagespeed.web.dev/) on the production URL
- Check Core Web Vitals (LCP, FID, CLS)
- Verify hero video loads with fallback poster image
- Confirm images use lazy loading below the fold

### 4.3 Security

- Verify `.env` files are not in the deployed bundle (`.gitignore` excludes `.env*`)
- Test contact form honeypot (submit with hidden field filled — should be rejected)
- Test rate limiting (submit >5 times in 60 seconds — should get 429)
- Verify HTML escaping in email output (submit `<script>` in a field)

---

## 5. DNS & Custom Domain

1. In Vercel Dashboard → Project → Settings → Domains
2. Add custom domain (e.g., `keanulerouxfa.co.za` or similar)
3. Configure DNS records as Vercel instructs (typically CNAME or A record)
4. Vercel auto-provisions SSL certificate
5. Update Sanity CORS origins with the custom domain

---

## 6. Ongoing Maintenance

### Content Updates
- Blog posts: Managed via Sanity Studio — changes appear within 60 seconds (ISR)
- Static content (services, social links, contact info): Update in `src/data/` files and redeploy

### Monitoring
- Vercel Analytics (built-in) for traffic and performance
- Vercel Logs for API route errors (contact form failures)
- Sanity usage dashboard for CMS API calls

### Known Open Items

59 open bugs remain (0 critical, 0 major, 39 minor, 20 cosmetic). Full details in:
- `quality-assurance/bugs.csv` — bug tracker
- `.kiro/source/post-implementation-requirements.md` — categorised backlog for next iteration

Key items for the next development cycle:
- Migrate native `<img>` to Next.js `<Image>` for optimization (BUG-062/065/070/095)
- Fix `<main>` landmark nesting (BUG-044/104)
- Add `generateMetadata` for blog post SEO (BUG-100)
- Expand test coverage for untested components (About, Services, Partners, Footer, Newsletter)
- Replace external Unsplash image dependencies with local/CMS assets
