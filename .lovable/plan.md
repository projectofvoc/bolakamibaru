

## Plan: Full HTML Table Support in Article Editor & Frontend

### Root Cause Analysis

The problem has **two sources**:

1. **TipTap Editor (Visual mode)** — StarterKit does not include table extensions. When content with `<table>` tags is loaded into the visual editor, TipTap strips all unknown HTML nodes, converting tables to flat text. Switching from HTML mode → Visual mode destroys tables.

2. **Frontend CSS** — `dangerouslySetInnerHTML` in `NewsDetail.tsx` and `ArticlePreview.tsx` renders raw HTML correctly, but `.article-content` in `index.css` has no table styling, so tables appear unstyled and break on mobile.

**Storage is fine** — the database stores raw HTML, no sanitization happens on save.

### Changes (4 files)

#### 1. `src/components/cms/RichTextEditor.tsx` — Add TipTap Table Extension
- Install and add `@tiptap/extension-table`, `@tiptap/extension-table-row`, `@tiptap/extension-table-header`, `@tiptap/extension-table-cell` extensions
- Add a "Table" toolbar button (insert 3×3 table)
- This ensures Visual mode preserves table HTML instead of stripping it

#### 2. `src/index.css` — Add Article Table Styles
- Add comprehensive `.article-content table` styles:
  - `width: 100%`, `border-collapse: collapse`
  - `th`/`td` with padding, borders
  - `thead` with distinct background (`bg-muted`)
  - Wrap tables in responsive container via `.article-content .article-table-wrapper` with `overflow-x: auto`
- Add matching `.tiptap table` styles for the editor preview
- Dark-theme compatible using existing CSS variables

#### 3. `src/pages/NewsDetail.tsx` — Wrap content for responsive tables
- After rendering `dangerouslySetInnerHTML`, add a `useEffect` that finds all `<table>` elements inside `.article-content` and wraps them in a `<div class="article-table-wrapper">` with `overflow-x: auto` for mobile responsiveness

#### 4. `src/components/cms/ArticlePreview.tsx` — Same table wrapper logic
- Apply the same table-wrapping logic so admin preview matches frontend output

### Table CSS (approximate)

```css
.article-content table {
  width: 100%;
  border-collapse: collapse;
  margin: 1.5rem 0;
  font-size: 0.938rem;
}
.article-content th, .article-content td {
  border: 1px solid hsl(var(--border));
  padding: 0.75rem 1rem;
  text-align: left;
}
.article-content thead th {
  background: hsl(var(--muted));
  font-weight: 600;
}
.article-content tbody tr:hover {
  background: hsl(var(--muted) / 0.3);
}
```

### Backward Compatibility
- Existing articles without tables are unaffected
- Table extension only adds capability, doesn't change other content
- CSS targets only `table` elements inside `.article-content`

