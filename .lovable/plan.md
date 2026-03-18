

## Plan: Fix Editor + Build Errors

### 1. Fix Build Errors (NodeJS namespace)

**Files:** `src/components/Header.tsx`, `src/hooks/useActivityTracker.ts`

Replace `NodeJS.Timeout` with `ReturnType<typeof setTimeout>` — this is the standard TypeScript-compatible type that works without Node.js type definitions.

### 2. Replace Split View with Toggle Mode

**File:** `src/pages/cms/CMSArticleEditor.tsx`

- Add state: `const [editorMode, setEditorMode] = useState<'visual' | 'html'>('visual')`
- Replace the split view grid (lines 776-815) with:
  - A header row with "Konten *" label on left, two toggle buttons ("Visual" / "HTML") on right
  - Conditional rendering: show `<RichTextEditor>` when `visual`, show `<Textarea>` when `html`
  - Both full width, no side-by-side
- Content stays synced via shared `form.content_id` state

### Result
- Clean single-editor view, default Visual
- Toggle to HTML only when needed
- No dual rendering

