

## Root Cause Analysis

There are **two critical bugs** preventing HTML tables from working:

### Bug 1: TipTap Version Mismatch (Primary Cause)
The table extensions are **v3.x** but the TipTap core is **v2.x**:
- `@tiptap/react`: `^2.11.5`
- `@tiptap/starter-kit`: `^2.11.5`
- `@tiptap/extension-table`: `^3.20.4` ← **INCOMPATIBLE**
- `@tiptap/extension-table-cell`: `^3.20.4` ← **INCOMPATIBLE**
- `@tiptap/extension-table-header`: `^3.20.4` ← **INCOMPATIBLE**
- `@tiptap/extension-table-row`: `^3.20.4` ← **INCOMPATIBLE**

v3 extensions silently fail with v2 core — TipTap doesn't register the table nodes, so all `<table>` tags are stripped when content is loaded into the editor or when switching from HTML to Visual mode.

### Bug 2: `ensureHtmlContent` Strips Tables
In `CMSArticleEditor.tsx` lines 80-96, the function checks for `<p>`, `<h1>`, `<h2>`, `<h3>`, `<ul>`, `<ol>`, `<blockquote>` — but **NOT** `<table>`. If an article contains only a table (no paragraphs), the function treats it as plain text and wraps it in `<p>` tags, destroying the HTML structure.

### What's Already Working
- CSS styling for tables in `index.css` — already implemented
- Responsive wrapper logic in `NewsDetail.tsx` and `ArticlePreview.tsx` — already implemented
- Table button in toolbar — already implemented
- `dangerouslySetInnerHTML` rendering — no sanitization, this is fine

---

## Fix Plan (2 files)

### 1. `package.json` — Downgrade table extensions to v2.x
Change all four table extension versions from `^3.20.4` to `^2.11.5` to match the TipTap core version.

### 2. `src/pages/cms/CMSArticleEditor.tsx` — Fix `ensureHtmlContent`
Add `<table>` to the list of recognized HTML tags so table-only content is not treated as plain text.

```typescript
if (content.includes('<p>') || content.includes('<h1>') || content.includes('<h2>') || 
    content.includes('<h3>') || content.includes('<ul>') || content.includes('<ol>') ||
    content.includes('<blockquote>') || content.includes('<table>')) {
  return content;
}
```

That's it — two targeted fixes that address the actual root causes. Everything else (CSS, wrappers, toolbar) was already implemented correctly.

