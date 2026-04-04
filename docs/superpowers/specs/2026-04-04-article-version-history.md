# Article Version History & Rollback

**Date:** 2026-04-04
**Status:** Approved

## Goal

Allow admins to view edit history of articles, compare content differences between versions, and rollback to any previous version. This improves article management by making edits reversible and changes auditable.

## Data Model

### New Table: ArticleVersion

```prisma
model ArticleVersion {
  id         String        @id @default(cuid())
  articleId  String
  article    Article       @relation(fields: [articleId], references: [id], onDelete: Cascade)
  version    Int
  title      String
  slug       String
  content    String
  summary    String?
  type       ArticleType
  status     ArticleStatus
  categoryId String
  tagIds     String[]      // Tag IDs stored as array (snapshot, not relational)
  createdAt  DateTime      @default(now())

  @@index([articleId, version])
}
```

Article model gains: `versions ArticleVersion[]`

### Design Decisions

- **tagIds as `String[]`**: Version snapshots are immutable historical records. Storing tag IDs as an array avoids a separate join table for version tags. Tag names can be resolved at display time.
- **slug included**: Full snapshot enables complete rollback without side effects.
- **version field**: Auto-incremented per article (query max + 1), not globally unique.
- **onDelete: Cascade**: Deleting an article removes all its versions.

## Retention Policy

Two independent conditions, applied after every new version is created:

1. **Quantity limit**: Keep the latest 10 versions per article. Delete oldest when exceeded.
2. **Time limit**: Delete versions with `createdAt` older than 6 months.

Both conditions run as cleanup after each version creation. They are independent — a version is deleted if it violates either condition.

## API Design

### 1. Version Creation (embedded in existing PUT)

`PUT /api/articles/[id]` — modified to:
1. Read current article state (including tag IDs from ArticleTag)
2. Write current state to ArticleVersion (version = max existing + 1)
3. Run retention cleanup
4. Execute existing update logic

No new endpoint needed for creation.

### 2. List Versions

```
GET /api/articles/[id]/versions
```

Returns all versions for the article, ordered by version DESC. Response includes: `id, version, title, createdAt` (no content — keep response lightweight).

### 3. Get Version Detail

```
GET /api/articles/[id]/versions/[versionId]
```

Returns full version snapshot including content. Used for diff comparison.

### 4. Rollback

```
POST /api/articles/[id]/versions/[versionId]/rollback
```

Logic:
1. Read target version snapshot
2. Save current article state as a new version (so rollback is reversible)
3. Overwrite Article with snapshot data (title, slug, content, summary, type, status, categoryId)
4. Rebuild ArticleTag relations (delete existing, create from tagIds)
5. Run retention cleanup

## UI Design

### Layout: Right Sidebar Panel

The version history panel sits to the right of the article edit form:

```
┌─ Edit Article ─────────────────────────────────────────┐
│                                        │ Version History│
│  [Title] [Summary]                     │ ┌────────────┐│
│  [Type] [Status] [Category]            │ │v5 Title  now││
│  [Tags]                                │ │  04/04 14:30││
│  [Content textarea]                    │ │v4 Title     ││
│                                        │ │  04/04 10:15││
│  [Update] [Cancel]          [Delete]   │ │  Diff Revert││
│                                        │ │v3 Title     ││
│                                        │ │  04/03 18:00││
│                                        │ │  Diff Revert││
│                                        │ └────────────┘│
└────────────────────────────────────────────────────────┘
```

- **Width**: Fixed w-72, sticky positioning (follows scroll)
- **Responsive**: Hidden on screens < lg breakpoint
- **Default state**: Expanded (always visible, no toggle needed)
- Only shown on edit pages (not on `/admin/articles/new`)

### Version List Item

Each version displays:
- Version number badge (current version highlighted with primary color + "now" badge)
- Article title at that version (truncated)
- Timestamp
- **Diff** button: Opens comparison dialog
- **Revert** button: Opens confirmation dialog

### Diff Dialog

Full-width modal (max-w-3xl) with two sections:

1. **Field Changes**: Shows changed metadata fields (title, status, category, tags) as `old → new` with strikethrough/highlight
2. **Content Diff**: Line-by-line diff with color coding:
   - Green background + left border: added lines
   - Red background + left border: removed lines
   - No highlight: unchanged lines

Stats shown: `+N added`, `-N removed`

**Diff implementation**: Use the `diff` npm package for text diffing.

### Rollback Confirmation

AlertDialog with message: "The current content will be automatically saved as a new version before rolling back. This action is reversible."

## New Files

- `prisma/schema.prisma` — add ArticleVersion model
- `src/app/api/articles/[id]/versions/route.ts` — list versions
- `src/app/api/articles/[id]/versions/[versionId]/route.ts` — version detail
- `src/app/api/articles/[id]/versions/[versionId]/rollback/route.ts` — rollback
- `src/components/admin/version-history.tsx` — sidebar panel component
- `src/components/admin/version-diff-dialog.tsx` — diff comparison dialog

## Modified Files

- `src/app/api/articles/[id]/route.ts` — PUT handler adds version creation + cleanup
- `src/app/admin/articles/[id]/page.tsx` — two-column layout with VersionHistory panel
- `package.json` — add `diff` dependency

## Dependencies

- `diff` npm package (~10KB) for text diffing
