# Phase 3 Optimizations Design Spec

## Overview

Three targeted optimizations building on Phase 2 (UI Redesign) completion:

1. Homepage article section redesign with masonry layout
2. Article editor Markdown preview
3. Automated article import via API, bookmarklet, iOS Shortcuts, and Lark bot

---

## 1. Homepage Article Section — Tab + Masonry Layout

### Current State

`src/app/page.tsx` lines 97-146: Hot Articles and Latest Articles displayed as two side-by-side columns, each containing a plain-text card list (title + category + badge). No cover images used.

### Design

Replace the two-column text list with a single Tab component (Hot / Latest) backed by a full-width 3-column masonry grid, reusing the existing `MasonryArticleCard` component.

**Component structure:**

```
src/app/page.tsx (Server Component)
  └─ queries hot + latest articles (6 each)
  └─ <HomepageArticles hot={...} latest={...} />

src/components/homepage-articles.tsx (new, Client Component)
  └─ Tab: Hot | Latest
  └─ 3-column CSS masonry (column-count)
     └─ <MasonryArticleCard /> (existing)
```

**Data changes:**

- Increase query limit from 5 to 6 (3 columns × 2 rows)
- Add `coverImage` to article select (already in schema)
- Add `category: { select: { id, name, icon } }` for MasonryArticleCard compatibility

**Responsive:**

- Desktop (md+): 3 columns
- Mobile: 2 columns

**Tab behavior:**

- Client-side tab switching only — both datasets fetched on the server and passed as props
- Default: Hot tab active
- No URL state / no persistence needed

### Files to Create

- `src/components/homepage-articles.tsx`

### Files to Modify

- `src/app/page.tsx` — replace hot/latest section with HomepageArticles component, update queries

---

## 2. Article Editor Markdown Preview — Edit/Preview Tab

### Current State

`src/components/admin/article-form.tsx` lines 236-242: Content edited in a plain `<textarea>` with monospace font, 20 rows, resizable. No preview capability.

### Design

Add Edit / Preview tabs above the textarea. Edit tab shows the existing textarea. Preview tab renders the content using the existing `MarkdownRenderer` component, matching article detail page styling.

**Component structure (within article-form.tsx):**

```
<div>
  <div className="flex border-b">  <!-- tab bar -->
    <button>Edit</button>
    <button>Preview</button>
  </div>
  {tab === "edit"
    ? <textarea .../>  (existing, unchanged)
    : <div className="prose ...">
        <MarkdownRenderer content={content} />
      </div>
  }
</div>
```

**Details:**

- Tab state: local `useState`, default "edit"
- Preview container: border + min-height matching textarea, padded, with `prose` styling
- Empty content: show muted "No content to preview" text
- No new dependencies — reuses `MarkdownRenderer` from `src/components/markdown-renderer.tsx`
- No toolbar buttons (bold, link, etc.) — user is proficient with Markdown syntax

### Files to Modify

- `src/components/admin/article-form.tsx` — add tab state and conditional rendering around textarea

---

## 3. Automated Article Import

Three layers: core API, client-side entry points, and Lark bot integration.

### 3.1 Core: Quick Import API

**New endpoint:** `POST /api/quick-import`

**Authentication:** `Authorization: Bearer <QUICK_IMPORT_API_KEY>` header. API Key stored in environment variable. Does not depend on NextAuth session — enables external callers (Shortcuts, bookmarklet, Lark bot).

**Request:**

```json
{ "url": "https://example.com/article" }
```

**Processing:**

1. Validate URL format
2. Call existing `importFromUrl(url)` from `src/lib/import.ts`
3. Auto-match category and tags (existing logic)
4. Fetch random Unsplash cover image (reuse logic from `/api/unsplash`)
5. Create DRAFT article in database with auto-generated slug

**Response (success):**

```json
{
  "success": true,
  "article": {
    "id": "clxxx...",
    "title": "Extracted Title",
    "slug": "extracted-title-1712345678",
    "editUrl": "/admin/articles/clxxx.../edit"
  }
}
```

**Response (error):**

```json
{
  "success": false,
  "error": "Failed to extract content from URL"
}
```

**Environment variable:** `QUICK_IMPORT_API_KEY`

### 3.2 Browser Bookmarklet

**New endpoint:** `GET /api/quick-import/bookmarklet?url=<URL>&key=<API_KEY>`

- GET for bookmarklet compatibility (bookmarklets can't easily do POST with headers)
- API key passed as query parameter
- Performs the same import logic as POST endpoint
- Returns a minimal HTML page showing result (title imported, or error)
- Page auto-closes after 3 seconds on success

**Bookmarklet code (user saves as bookmark):**

```javascript
javascript:void(window.open('https://your-domain/api/quick-import/bookmarklet?url='+encodeURIComponent(location.href)+'&key=YOUR_KEY'))
```

### 3.3 iOS Shortcuts Configuration Guide

No code needed. Document the setup steps:

1. Create new Shortcut, add "Get URLs from Input" action
2. Add "Get Contents of URL" action:
   - URL: `https://your-domain/api/quick-import`
   - Method: POST
   - Headers: `Authorization: Bearer YOUR_KEY`
   - Body: JSON `{ "url": "<URL from step 1>" }`
3. Add "Show Notification" action with result
4. Add Shortcut to Share Sheet (accept URLs)

### 3.4 Lark (Feishu) Bot

**Architecture:**

```
User sends URL in Lark chat
  → Lark Event Subscription (im.message.receive_v1)
  → POST /api/lark-webhook
  → Extract URL from message text
  → Call importFromUrl() + create DRAFT article
  → Reply via Lark Send Message API
```

**New endpoint:** `POST /api/lark-webhook`

**Lark verification:** Handle URL Verification challenge on first setup — return `{ "challenge": "<token>" }`.

**Message processing:**

1. Verify request signature using `LARK_VERIFICATION_TOKEN`
2. Extract message content — parse `text` type messages for URLs (regex)
3. Validate sender against allowed user list (`LARK_ALLOWED_USER_IDS` env var) — admin only
4. For each URL found: call `importFromUrl()`, create DRAFT, fetch Unsplash cover
5. Reply to the Lark message with result card:
   - Success: article title + edit link
   - Failure: error reason

**Lark API calls (outbound):**

- `POST https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal` — get access token
- `POST https://open.feishu.cn/open-apis/im/v1/messages/:message_id/reply` — reply to message

**Environment variables:**

- `LARK_APP_ID` — Feishu app ID
- `LARK_APP_SECRET` — Feishu app secret
- `LARK_VERIFICATION_TOKEN` — Event subscription verification token
- `LARK_ALLOWED_USER_IDS` — comma-separated list of allowed Lark user IDs

**Feishu platform setup (manual, documented in spec):**

1. Create app at open.feishu.cn
2. Enable Bot capability
3. Add `im:message:receive_v1` event subscription
4. Set Request URL to `https://your-domain/api/lark-webhook`
5. Add `im:message` (read) and `im:message:send_as_bot` (send) permissions
6. Publish app

### Files to Create

- `src/app/api/quick-import/route.ts` — POST endpoint
- `src/app/api/quick-import/bookmarklet/route.ts` — GET endpoint with HTML response
- `src/app/api/lark-webhook/route.ts` — Lark event handler
- `src/lib/lark.ts` — Lark API helper (get token, send reply)

### Files to Modify

- `.env.example` — add new environment variables
- `docker-compose.dev.yml` — add new environment variables

---

## Out of Scope

- Rich Markdown editor (CodeMirror, Monaco) — textarea is sufficient
- Markdown toolbar buttons — user knows Markdown syntax
- Other IM bots (DingTalk, Telegram, WeChat) — can be added later by calling Quick Import API
- Article review/edit before import in Lark — always creates DRAFT, user edits in admin
- Real-time sync or WebSocket — all operations are request/response
