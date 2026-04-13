

## Bot Sender Otomatis untuk CMS

### Overview

Fitur ini menambahkan sistem pengiriman berita otomatis via bot (Telegram, dll) ketika artikel dipublish. Termasuk halaman settings di CMS, tracking status pengiriman, logging, retry mechanism, dan manual send.

### Database Changes (3 migrations)

**Migration 1: `bot_sender_settings` table**

```sql
CREATE TABLE public.bot_sender_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  is_enabled boolean NOT NULL DEFAULT false,
  auto_send_on_publish boolean NOT NULL DEFAULT true,
  allow_manual_send boolean NOT NULL DEFAULT true,
  provider_name text NOT NULL DEFAULT 'telegram',
  bot_token text,
  api_key text,
  secret_key text,
  endpoint_url text,
  destination_id text,
  default_template text DEFAULT '📰 {title}\n\n{excerpt}\n\n🔗 Baca selengkapnya:\n{article_url}',
  fallback_image_url text,
  send_mode text NOT NULL DEFAULT 'photo_caption',
  parse_mode text NOT NULL DEFAULT 'HTML',
  use_fallback_image boolean NOT NULL DEFAULT true,
  retry_enabled boolean NOT NULL DEFAULT true,
  max_retry_count integer NOT NULL DEFAULT 3,
  retry_delay_seconds integer NOT NULL DEFAULT 30,
  request_timeout_seconds integer NOT NULL DEFAULT 30,
  send_without_image boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.bot_sender_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage bot settings" ON public.bot_sender_settings
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Seed default row
INSERT INTO public.bot_sender_settings (id) VALUES (gen_random_uuid());
```

**Migration 2: Add send tracking columns to `articles`**

```sql
ALTER TABLE public.articles
  ADD COLUMN send_status text DEFAULT 'not_sent',
  ADD COLUMN is_sent boolean DEFAULT false,
  ADD COLUMN sent_at timestamptz,
  ADD COLUMN send_error text,
  ADD COLUMN external_message_id text,
  ADD COLUMN send_attempt_count integer DEFAULT 0;
```

**Migration 3: `article_send_logs` table**

```sql
CREATE TABLE public.article_send_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id uuid NOT NULL,
  send_status text NOT NULL DEFAULT 'pending',
  request_payload jsonb,
  response_payload jsonb,
  error_message text,
  attempt_number integer NOT NULL DEFAULT 1,
  sent_to text,
  provider_name text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.article_send_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage send logs" ON public.article_send_logs
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
```

### Edge Function: `bot-send-article`

New edge function that:
1. Receives `article_id` and optional `force` flag
2. Fetches `bot_sender_settings` — validates config is complete and enabled
3. Fetches article data — validates it's published and (unless `force`) not already sent
4. Formats message using the template from settings
5. Sends via provider API (Telegram `sendPhoto` or `sendMessage`)
6. Updates `articles.send_status`, `sent_at`, `is_sent`, `external_message_id`
7. Inserts log into `article_send_logs`
8. On failure: updates `send_status = 'failed'`, `send_error`, logs error
9. Supports `action: 'test_connection'` and `action: 'test_message'` for settings page

### Frontend Changes

**1. New page: `src/pages/cms/CMSBotSender.tsx`**

Settings page with sections:
- General Settings (toggles: enable, auto-send, manual send)
- Provider Configuration (provider name, bot token, endpoint URL, destination ID)
- Message Settings (template, send mode, parse mode, fallback image)
- Retry & Delivery (retry toggle, max count, delay, timeout)
- Testing Tools (Test Connection + Send Test Message buttons)
- Save button with validation

**2. Update `src/pages/cms/CMSArticleEditor.tsx`**

After successful save with `status === 'published'`:
- Call `bot-send-article` edge function if auto-send is enabled
- Show toast with send result

**3. Update `src/pages/cms/CMSArticles.tsx`**

- Add `send_status` column to the table
- Show badges: Not Sent / Queued / Sent / Failed
- Add dropdown actions: Send Now, Retry Send, View Send Logs
- Send Logs dialog showing `article_send_logs` for that article

**4. Update routing & sidebar**

- Add route `/cms/bot-sender` in `App.tsx`
- Add "Bot Sender" menu item in `CMSLayout.tsx` admin section
- Add export in `src/pages/cms/index.ts`

### File Summary

| File | Action |
|------|--------|
| 3 DB migrations | Create tables + alter articles |
| `supabase/functions/bot-send-article/index.ts` | New edge function |
| `src/pages/cms/CMSBotSender.tsx` | New settings page |
| `src/pages/cms/CMSArticles.tsx` | Add send status + actions |
| `src/pages/cms/CMSArticleEditor.tsx` | Auto-send after publish |
| `src/pages/cms/CMSLayout.tsx` | Add sidebar menu item |
| `src/App.tsx` | Add route |
| `src/pages/cms/index.ts` | Add export |

### Scalability Note

The `bot_sender_settings` table uses a single-row pattern for now. To support multiple destinations later, it can be converted to multi-row with a `destination_name` field. The edge function and UI are designed to be modular for this evolution.

