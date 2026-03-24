

## Plan: Google Analytics & Search Console CMS Integration

### Overview
Add a new "Integrations" page in CMS where admin can configure Google Analytics and Google Search Console dynamically from the database, without code changes.

### 1. Database Migration — `site_integrations` table

Create a new table to store integration settings:

```sql
CREATE TABLE public.site_integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,        -- e.g. 'ga_measurement_id', 'gsc_method', 'gsc_verification_code'
  value text NOT NULL DEFAULT '',
  updated_at timestamptz DEFAULT now(),
  updated_by uuid
);

ALTER TABLE public.site_integrations ENABLE ROW LEVEL SECURITY;

-- Admins can manage
CREATE POLICY "Admins can manage integrations" ON public.site_integrations
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- Public can read (needed for frontend script injection)
CREATE POLICY "Public can read integrations" ON public.site_integrations
  FOR SELECT TO public USING (true);
```

Keys stored: `ga_measurement_id`, `gsc_method` (`meta_tag` or `html_file`), `gsc_verification_code`

### 2. New CMS Page — `src/pages/cms/CMSIntegrations.tsx`

Two sections:

**A. Google Analytics**
- Input field for Measurement ID (validated: must start with `G-`)
- Save button → upserts to `site_integrations`
- "Test Integration" button → checks if `window.gtag` exists

**B. Google Search Console**
- Dropdown: Meta Tag / HTML File
- If Meta Tag: input for verification code, saves to DB
- If HTML File: note explaining this requires manual file placement (SPA limitation)
- "Test Integration" button → checks if meta tag exists in DOM

### 3. Global Script Injector — `src/components/GoogleIntegrations.tsx`

A component placed in `App.tsx` (alongside `AnalyticsTracker`) that:
- Fetches `ga_measurement_id` and `gsc_verification_code` from `site_integrations` table
- If GA ID exists and starts with `G-`: dynamically creates and appends the gtag.js `<script>` tags to `<head>`
- If GSC verification code exists: dynamically creates and appends `<meta name="google-site-verification">` to `<head>`
- Prevents duplicate injection using element ID checks
- Cleans up on unmount

### 4. Wire Up Routes & Sidebar

**Files changed:**
- `src/pages/cms/CMSLayout.tsx` — add "Integrations" menu item with Settings icon
- `src/pages/cms/index.ts` — export new page
- `src/App.tsx` — add route `/cms/integrations` and import `GoogleIntegrations` component

### 5. HTML File Upload Limitation

Since this is an SPA, we cannot dynamically serve files at arbitrary root URLs like `/googleXXXX.html`. The plan will:
- Clearly note this in the UI
- Recommend Meta Tag method as the primary approach
- For HTML file method, show instructions to manually place the file

### Technical Details

```text
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  CMS Admin  │────▶│ site_integrations│────▶│ GoogleIntegrations│
│  Settings   │     │    (database)    │     │   (App.tsx)      │
│  Page       │     │                  │     │  injects <script>│
└─────────────┘     └──────────────────┘     │  injects <meta>  │
                                              └─────────────────┘
```

### Files Changed (5 files + 1 migration)

1. **Migration** — create `site_integrations` table
2. **`src/pages/cms/CMSIntegrations.tsx`** — new CMS settings page
3. **`src/components/GoogleIntegrations.tsx`** — dynamic script/meta injector
4. **`src/pages/cms/CMSLayout.tsx`** — add sidebar menu item
5. **`src/pages/cms/index.ts`** — export new page
6. **`src/App.tsx`** — add route + injector component

