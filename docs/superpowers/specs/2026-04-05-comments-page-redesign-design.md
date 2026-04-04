# Admin Comments Page Redesign

## Goal

Redesign `/admin/comments` page with stats overview + grouped-by-article list with expandable comments, replacing the current card-per-comment layout.

## Layout

### Header
- Title: "Comments" with subtitle showing total count
- No action button (comments are read/delete only)

### Stats Cards Row (3 columns, `grid grid-cols-3 gap-4`)
- **Total Comments** — purple accent, count of all comments
- **Today** — green accent, comments with `createdAt` matching today
- **Active Articles** — blue accent, count of distinct article IDs

All stats computed client-side from the fetched comments array. No API changes needed.

### Grouped List (single Card)
- Comments grouped by `article.title`, sorted by most recent comment first per group
- **Article group header**: article title (left) + comment count Badge (right), subtle background distinction (`bg-muted/30`)
- **Comment rows**: avatar circle (first letter of nickname) + nickname + date on first line, comment content on second line
  - Short comments: displayed inline, single line
  - Long comments (>100 chars): truncated with `...`, show expand toggle (▼). On click, expand inline showing full text in a subtle bordered box below the row. Toggle becomes ▲ Collapse.
- **Delete**: AlertDialog confirmation on each row, consistent with categories/tags pages
- **Hover**: `hover:bg-accent/50` on comment rows
- **Empty state**: centered message "No comments yet."

## File Modified
- `src/app/admin/comments/page.tsx` — full rewrite

## API
No changes. Uses existing `GET /api/comments?all=true` and `DELETE /api/comments/:id`.
