# Deployment — KR8 Digitals (incl. Mindset Shift 7.0)

The site is a single-page Vite app. Deployment is a static upload: build,
upload, done. Mindset Shift 7.0 ships in this same build — there is no
separate deploy for it.

## 1. Build

```bash
npm install
npm run build        # tsc -b && vite build
```

Output: `dist/` — a single `index.html` (all JS/CSS inlined) plus the
static assets from `public/` (flyers, branding, videos, fonts, favicons,
`.htaccess`, `robots.txt`, `sitemap.xml`).

Verified production build size: ~2.77 MB (`index.html`, ~756 KB gzip).

## 2. Hostinger (shared hosting)

1. Upload **everything in `dist/`** to the web root (`public_html/`).
   - The included `.htaccess` already rewrites all non-file routes to
     `index.html` (required for deep links like `/mindset-shift`,
     `/admin`, `/verify`).
2. No Node server, no database server needed.
3. Test the live URLs:
   - `https://kr8digitals.com/mindset-shift` — public event page
   - `https://kr8digitals.com/admin` — admin dashboard (noindexed)

## 3. Supabase (cross-device sync — optional but recommended)

Mindset Shift is local-first: everything works with zero backend. The
Supabase layer syncs registrations + event config across devices so
admins can verify from any phone/laptop and participants can resume on
another device with their confirmation code.

1. Run the SQL in `src/data/mindsetShift.ts` → exported constant
   `MS_SUPABASE_SQL` (creates `mindset_shift_event` +
   `mindset_shift_registrations` incl. the `deleted_at` tombstone
   column, with an `add column if not exists` migration line for
   tables created before soft-delete existed, and realtime
   publications).
2. Enter the project URL + anon key in the Admin Dashboard's
   Supabase settings (it re-initializes the sync layer automatically).

## 4. Admin workflow (no deploy needed for any of this)

Everything participant- and event-related is admin-managed live:

- **Event settings** — theme, date, flyer (upload), speaker, host,
  story, topics, share copy (6 platforms), WhatsApp group link,
  access switch, privacy note, SEO title/description, event start
  (JSON-LD). Save → public page updates instantly, no deploy.
- **Verification** — review share proofs, approve / request
  resubmission / reject, revoke, delete (soft-delete tombstones sync
  to the cloud), CSV export of the filtered view.
- **Analytics** — registrations, pipeline funnel, daily chart,
  acquisition sources, access conversion.

## 5. Test suites

All suites run against the dev server:

```bash
npm run dev    # Vite on :5173
node tests/test_mindset_shift_registration.cjs   # registration form + dedupe
node tests/test_mindset_shift_flow.cjs           # share-before-access flow
node tests/test_mindset_shift_whatsapp.cjs       # WhatsApp link secrecy
node tests/test_mindset_shift_admin.cjs          # verification panel
node tests/test_mindset_shift_event.cjs          # event settings
node tests/test_mindset_shift_participants.cjs   # participant management
node tests/test_mindset_shift_analytics.cjs      # analytics
node tests/test_mindset_shift_security.cjs       # privacy / gates / edge
node tests/test_mindset_shift_responsive.cjs     # 4 viewports + a11y
node tests/test_mindset_shift_seo.cjs            # head tags + Event JSON-LD
node tests/test_mindset_shift_journey.cjs        # full journey, desktop+mobile
node tests/test_critical_fixes.cjs               # existing-site regression
node tests/test_full_regression.cjs              # existing-site regression
```

After `npm run build`, also run the production smoke test (serves `dist/`
with the same SPA fallback Hostinger's `.htaccess` provides, checks every
key route + assets, zero JS errors):

```bash
node tests/test_production_smoke.cjs
```

All suites green as of the Mindset Shift 7.0 completion + full
post-completion audit (16/16 steps).

## 6. GitHub

No remote is configured in this workspace. From a machine with access
to the repo:

```bash
git remote add origin git@github.com:<owner>/kr8-digitals.git
git push -u origin main
```

## Architecture notes (Mindset Shift)

- Single source of truth: `src/data/mindsetShift.ts`
  - `kr8_mindset_shift_event_v1` — event config (admin-managed)
  - `kr8_mindset_shift_registrations_v1` — participants (local + cloud)
  - events: `kr8:ms-event-updated`, `kr8:ms-regs-updated`
- Sync: `src/lib/mindsetShiftSync.ts` (hydrate → push pending → realtime)
- Public page: `src/pages/MindsetShiftPage.tsx` +
  `src/components/MindsetShiftRegistration.tsx` (form, resume, gates) +
  `src/components/MindsetShiftAccessFlow.tsx` (3-step journey)
- Admin: `src/components/admin/MindsetShiftTab.tsx` → Verification
  (`MindsetShiftManager`), Event settings (`MindsetShiftEventManager`),
  Analytics (`MindsetShiftAnalytics`)
- Design rule: the WhatsApp group link is admin-managed and rendered
  only for `access_granted` participants while `accessEnabled` is on —
  it never exists in the DOM for anyone else.
