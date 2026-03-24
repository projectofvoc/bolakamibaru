

## Fix: GSC Meta Tag in Static HTML Source

### Problem
Google Search Console requires the `google-site-verification` meta tag in the **initial HTML response** (view-source). Currently it's injected client-side via React `useEffect`, which only appears in the live DOM after JavaScript executes. GSC verification bots may not detect it.

### Constraint
This is a Vite SPA hosted on Lovable — there is no server-side rendering. The only way to get a meta tag into `view-source` is to include it in `index.html` at **build time**.

### Solution: Vite HTML Transform Plugin

Create a Vite plugin that runs during build, fetches the GSC verification code from the database, and injects it into the `<head>` of `index.html`.

**How it works:**
1. During Vite build, the plugin queries `site_integrations` table for `gsc_verification_code`
2. Injects `<meta name="google-site-verification" content="...">` into `<head>`
3. The tag appears in the static HTML served to all visitors and crawlers

**Trade-off:** When admin changes the verification code in CMS, a rebuild is needed. In Lovable, any code change triggers a rebuild automatically. We'll add a note in the CMS UI explaining this.

### Files Changed

#### 1. `vite.config.ts` — Add HTML transform plugin
Add a plugin that fetches the verification code from Supabase at build time and injects it into `<head>`.

```typescript
function gscMetaPlugin() {
  return {
    name: 'inject-gsc-meta',
    async transformIndexHtml() {
      try {
        const res = await fetch(`${supabaseUrl}/rest/v1/site_integrations?key=eq.gsc_verification_code&select=value`, {
          headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` }
        });
        const data = await res.json();
        if (data?.[0]?.value) {
          return [{ tag: 'meta', attrs: { name: 'google-site-verification', content: data[0].value }, injectTo: 'head' }];
        }
      } catch {}
      return [];
    }
  };
}
```

#### 2. `src/pages/cms/CMSIntegrations.tsx` — Update UI note
Add a note explaining that GSC verification code changes require a rebuild to take effect in the static HTML source. The client-side injection remains as a fallback.

#### 3. `src/components/GoogleIntegrations.tsx` — Keep as-is
The client-side injection stays as a secondary mechanism. No changes needed.

### Technical Details

```text
Build Time:
  vite.config.ts plugin → fetches site_integrations → injects <meta> into index.html

Runtime (fallback):
  GoogleIntegrations.tsx → useEffect → appends <meta> to DOM
```

The verification code will appear in both `view-source` (from build) and live DOM (from React). Google will detect it from the static HTML.

