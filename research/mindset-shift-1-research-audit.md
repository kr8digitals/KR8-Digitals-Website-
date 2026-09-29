# Mindset Shift 7.0 — STEP 1: Research & Existing-System Audit

Date: 2026-09-29. All facts below verified from the sources listed. Nothing invented.

---

## A. FLYER (official, Google Drive → research/mindset-shift-7-flyer.jpg, 2611×3264 portrait)

Staged for production: `public/events/mindset-shift-7-flyer.jpg`

Verified facts:
- Program: **Mindset Shift** (brand band on flyer; edition 7.0 per client brief)
- Branding: **KR8 DIGITALS TRIBE** with official KR8 logo
- Theme headline: **BUILDING WEALTH:**
- Subtitle: **How To Get Out Of Debt And Build Wealth.**
- Host: **Timfire (Kenneth Timothy)** — photo: cream shirt, purple glow background
- Guest speaker: **Sagacious Tehilla** — photo: black gold-embroidered outfit, purple glow background
- Date: **4th October 2026** (a Sunday — consistent with the first-Sunday slot)
- Time: **9PM**
- Location: **kr8digitals.com** (online event)
- CTA: **Registration is free.** (repeated, bottom band)

Visual identity (design reference):
- Light lavender/white base (~#f6f1fb), deep purple→violet gradients (≈ #4c1d95 → #7c3aed → #a855f7)
- Two portrait cards with purple glow backdrops; name plates = purple gradient bars, white bold text; role labels in deep purple below
- Very bold condensed display type for the theme; "Mindset Shift" pill band with hairline rules
- Bottom info bar: calendar / clock / location pin icons, deep purple ink
- Footer: purple gradient band, white "Registration is free."
- Mood: premium, energetic, financial, clean — NOT dark-mode

---

## B. GUEST SPEAKER — Sagacious Tehilla (source: sagacioustehilla.com, fetched in full)

Portrait (official site asset, saved): `research/sagacious-tehilla-portrait.png` (1122×1402)
Website: https://sagacioustehilla.com/ · Consultation: wa.me/2349123006608

Verified positioning (his own words):
- "Psychology-Driven Marketing Strategist | Copywriter | Business Growth Consultant"
- Also self-identifies as **Author** and **Entrepreneur**
- "People don't buy products. They buy what their minds have already decided to believe."
- Philosophy: "People don't buy because they understand. People buy because they feel understood."
- "Marketing & psychology isn't about convincing people. It's about removing resistance — the thing stopping people from buying, trusting and taking action."
- "Most brands have a perception problem. When people perceive you correctly, they trust faster, buy quicker, and recommend you more."

Work: copywriting (sales/landing pages, launch campaigns, VSLs, WhatsApp funnels, product positioning), marketing strategy (customer acquisition, offer positioning, consumer psychology, launch strategy, growth consulting), brand positioning (personal/business brands, messaging, authority positioning), consulting (identifying "invisible leaks" in conversion/trust/sales).
Clients/served: founders, CEOs, startups, business owners, coaches, consultants, agencies, experts, personal brands, organizations, politicians, celebrities.
Organizations built with ("Where I've Built"): Maarketplaace Technologies, Baggyt, Brandevo.ng, Newton Tech Academy, Knowledge Money University.
Results claim (his own, attribute as such): campaigns/systems that helped businesses "sell thousands of digital products, build a solid fan base and audience, and generate millions in revenue."
Frameworks: **Brain Seduction™** (how attention, trust, desire, buying decisions form pre-purchase), **Subconscious Marketing™** (perception, emotion, memory, behavioural psychology over pressure). Community: **Mystery Mastery Community**.
Published works (6): The Fake Life Detector · Hack Her Soul, Hijack His Brain · Sales & Marketing My Padi · Subconscious Marketing · Expert Visibility · Brain Seduction.
Invited speaking topics (his list): marketing psychology, consumer behaviour, brand positioning, sales, customer trust, digital business, personal branding, business growth.

Relevance angle for the event (interpretation, not new facts): his core idea — decisions (incl. money decisions) are formed by beliefs and perception BEFORE action — maps directly onto "money mindset", "getting out of debt", "building wealth intentionally".

---

## C. HOST — Timfire (Kenneth Timothy)

- Flyer: "Timfire (Kenneth Timothy) — Host"
- Site's own verified founder record (store.ts DEFAULT_FOUNDERS + founder account): **Timfire (Kenneth Timothy Iziogo)** — "CEO · Founder · Website Development"; bio: "Founder, AI agent developer, website developer, graphic designer, video editor, and linguistics student." Founder & CEO of KR8 Digitals.
- Facebook profile (facebook.com/kutimfire): **not fetchable (HTTP 403)** — no additional facts taken from it; nothing fabricated.
- Program facts (client-verified): Mindset Shift is a **recurring program hosted twice every month — first Sunday and third Sunday**. Present as philosophy/environment, no invented history or stats.

---

## D. EXISTING-SYSTEM AUDIT (what to reuse — do NOT rebuild)

1. **Routing** — `src/App.tsx` `<Routes>` inside `Layout`: add `/mindset-shift` (public, guest-accessible).
2. **Data persistence** — `src/data/store.ts` `load/save` (localStorage, JSON, `kr8_*` keys) + custom window events for live update (pattern: `kr8:cms-updated`, `kr8:accounts-updated`, `kr8:waitlist-updated`).
3. **CMS (admin → live page)** — `src/data/cmsStore.ts`: typed `SiteContent`, `getSiteContent()`, `saveSiteContent(patch)`, `DEFAULT_SITE_CONTENT`; pages subscribe to `kr8:cms-updated` and re-sync. **This is the proven pattern for "Admin Dashboard controls the live page".**
4. **Large media** — `src/utils/mediaStorage.ts`: IndexedDB vault (`kr8_media_vault_v1`), `saveMediaAsset/getMediaAsset` with `idb:*` keys; used by AnnouncementManager (FileReader → data URL → vault). **Use this for proof screenshots + flyer replacement uploads.**
5. **Supabase** — `src/lib/supabase.ts` client (`getSupabase()`, env/defaults/localStorage); tables in use: `accounts`, `live_streams`, `streams`, `live_chat`, `stream_chat_messages`. Schema managed via **SupabaseManager's copy-SQL block** (admin runs it in Supabase SQL editor — established workflow; no service-role needed). Realtime subscriptions + /verify-style hydration available for cross-device sync.
6. **Admin Dashboard** — `src/pages/Admin.tsx`: `ADMIN_GROUPS` (5 categories) → items `{id,label,icon,badge}`; render via `{tab === "X" && <XManager/>}`; permission gate `allowedSections` from `ADMIN_SECTIONS` (store.ts) + per-staff `admin.permissions`; ultimate admin (founder) sees all. Extracted managers live in `src/components/admin/` (WebsiteContentManager, AnnouncementManager, SignatureManager, GranularPermissionsManager). Modals portal to `document.body` (never nest in backdrop-filter Card).
7. **UI kit** — `src/components/ui.tsx`: Card, Pill, GradientButton, GhostButton, SectionHead, GlowImage; `Icon` (fixed name set incl. "shield","spark","calendar","users","video","trophy","search","close","menu","check","lock","unlock","certificate","share","message","bot","pen","book","briefcase","chart","palette","calendar","youtube","tiktok","instagram","facebook","x","linkedin"); `Marquee`.
8. **Auth** — `useAuth()` (student/signIn/signOut/notifications); Admin two-step unlock (login modal → unlock → admin password); `isUltimate`, `canAccessAdminSection`.
9. **International phone inputs** — `COUNTRIES`, `countryByCode`, `buildPhone`, `normalizePhone`, `detectCountryCode` (store.ts) + `CountryPhone` component.
10. **SEO** — `src/lib/useSeo.ts` (title, description, canonical, og/twitter, robots, route JSON-LD). Event page must be indexable (public campaign).
11. **Events/live system** — LiveKit live streams (`live_streams` table, LivePage) is the *existing* live system; Mindset Shift is a separate campaign flow (registration → share → proof → WhatsApp access) and must not touch live-stream logic.
12. **Waitlist pattern** — `getWaitlistWhatsAppUrl/saveWaitlistWhatsAppUrl` (admin-managed WhatsApp link + event) — the closest precedent for "admin-managed WhatsApp destination".

## E. ARCHITECTURE DECISIONS (for STEP 2+)

- **Event content store** — `src/data/eventStore.ts`: `MindsetShiftEvent` (edition, title, theme, headline, sub, date, time, locationUrl, speaker{name,role,tagline,bio,credentials[],photo}, host{name,role,bio}, story copy, topics[], audience[], speaker bio fields, shareCopy{whatsappStatus,facebook,instagram,x,linkedin,general}, whatsappGroupUrl, accessEnabled, regOpen, capacity(0=off), flyerKey(flyer path or idb key), questions config) + `getEvent/saveEvent(patch)` + `kr8:event-updated` event. Seeded from the verified flyer facts above; admin can edit everything live.
- **Registration store** — same module or sibling `eventRegistrations`: records in localStorage (`kr8_ms7_registrations_v1`) for the participant's own continuity + upsert to new Supabase table `mindset_shift_registrations` for cross-device admin visibility (SQL appended to SupabaseManager schema block; realtime subscription for the admin queue; /verify-style hydration on admin load).
- **Status lifecycle** — `registered` → `share_submitted` → `access_granted` | `rejected` | `needs_resubmission` (labels: Registered / Share Submitted / Access Granted / Rejected–Needs Resubmission). Approval flips status + exposes the admin-managed WhatsApp link on the participant's page.
- **Proof handling** — file input (image/* only, ≤3MB), FileReader → data URL → IndexedDB vault locally + base64 `proof` column in Supabase; admin opens/zooms, approves/rejects with internal note; resubmission replaces proof and resets status.
- **Public route** — `/mindset-shift` (single-page campaign: hero → why it matters → what you'll explore → speaker → host → who it's for → register → post-registration share flow → proof upload → access state). useSeo indexable + Event JSON-LD; og:image = flyer (plus 1200×630 campaign card).
- **Admin** — new group/section "Mindset Shift" (badge "Live"): Event Content manager, WhatsApp Access manager, Registrations manager (search/filter/sort/paginate — no giant dropdowns), Share Proof review queue, Analytics (totals by status, source breakdown, daily trend).
- **Edge cases** — refresh-safe (localStorage), duplicate registration (normalized email+phone match → resume existing record), rejected → resubmit, link changes → public page always reads current admin value, regOpen/capacity gating, upload validation (type/size), network failure → `syncPending` flag retried on load, privacy: financial reflections visible only in admin.

## F. ASSETS
- `research/mindset-shift-7-flyer.jpg` (official flyer, 2.9MB) → staged `public/events/mindset-shift-7-flyer.jpg`
- `research/sagacious-tehilla-portrait.png` (official site portrait)
