

## Fix: GSC Meta Tag Not Injected

### Root Cause

**Query key mismatch between CMS and injector.**

- `CMSIntegrations.tsx` uses query key `['site-integrations']` and invalidates that key on save
- `GoogleIntegrations.tsx` uses query key `['site-integrations-global']`

These are different React Query keys. When admin saves the verification code, only `['site-integrations']` is invalidated — the global injector's cache (`['site-integrations-global']`) is never refreshed. The meta tag is never injected because the injector either has stale data or never fetched at all.

### Fix (2 files, minimal changes)

#### 1. `src/components/GoogleIntegrations.tsx`
- Change query key from `['site-integrations-global']` to `['site-integrations']` so it shares the same cache as the CMS page

#### 2. `src/pages/cms/CMSIntegrations.tsx`
- No change needed — it already invalidates `['site-integrations']`

That's it. One line change. The meta tag injection logic itself is correct — it just never received the data due to the cache key mismatch.

### Secondary issue: "View Page Source" vs live DOM
Since this is a Single Page Application, the meta tag will appear in the **live DOM** (DevTools → Elements) but NOT in "View Page Source" (which shows static HTML). Google's verification bot renders JavaScript, so GSC verification will still work. The "Test Integration" button in CMS checks the live DOM, which is correct.

