## Goal
Scale the event badge size up by ~3x.

## Changes
In `src/components/EventBadge.tsx`:
- **Icon-only badges** (no label): increase padding and icon size ~3x
  - `size="sm"`: padding `p-1` → `p-3`, icon `w-3 h-3` → `w-7 h-7`
  - `size="md"`: padding `p-1.5` → `p-4`, icon `w-4 h-4` → `w-9 h-9`
- **Text badges**: remain unchanged to avoid breaking card / detail layouts

## Technical notes
- No database schema changes.
- No other components need updating — `EventBadge` is self-contained.
- Brand colors and icon map stay as-is.