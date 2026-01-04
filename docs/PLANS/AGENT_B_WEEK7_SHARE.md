# Agent B Week 7 — Share Link Schema & Generation

**Phase:** Phase 3 - Live Mode (Week 7)
**Focus:** Share link database schema, generation service, and API routes
**Agent:** B

---

## Overview

Share links allow the meal host to share a read-only view of the cooking timeline with family members. The link:
- Contains a UUID v4 token
- Expires 24 hours after serve time
- Provides read-only access to meal data and live task progress

---

## Database Schema

### meal_share_tokens Table

```sql
create table meal_share_tokens (
  token uuid primary key default gen_random_uuid(),
  meal_id uuid not null references meals(id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);
```

**Design Decisions:**
- **token as PK**: UUID v4 is the primary key (no separate `id`), keeping URLs clean
- **CASCADE delete**: When meal is deleted, share tokens are removed
- **expires_at**: Pre-calculated at creation time (serve_time + 24 hours)
- **No user tracking**: V1 is single-user, so no need for `created_by`

### RLS Policy

```sql
-- Public SELECT for valid, non-expired tokens
create policy "share_tokens_public_read"
  on meal_share_tokens for select
  using (expires_at > now());

-- Full access for host (insert/delete)
create policy "share_tokens_host_manage"
  on meal_share_tokens for all
  using (true);
```

---

## TypeScript Types

### src/types/share.ts

```typescript
export interface ShareToken {
  token: string;          // UUID v4
  mealId: string;
  createdAt: string;      // ISO 8601
  expiresAt: string;      // ISO 8601
}

export interface ShareLinkResult {
  token: string;
  url: string;            // Full shareable URL
  expiresAt: string;
}
```

---

## Service Implementation

### src/lib/services/share/share-service.ts

```typescript
interface ShareService {
  generateLink(mealId: string): Promise<ShareLinkResult>;
  validateToken(token: string): Promise<{ valid: boolean; mealId?: string }>;
  getShareData(token: string): Promise<ShareMealData | null>;
  revokeLink(mealId: string): Promise<void>;
}
```

**Expiration Calculation:**
- Fetch meal's `serve_time`
- Add 24 hours: `new Date(serveTime).getTime() + 24 * 60 * 60 * 1000`
- Store as `expires_at` in database

---

## API Routes

### POST /api/share

**Request:**
```json
{ "mealId": "uuid" }
```

**Response:**
```json
{
  "token": "abc123...",
  "url": "https://sundaydinner.app/share/abc123...",
  "expiresAt": "2026-01-06T14:00:00Z"
}
```

### GET /api/share/[token]

**Response (valid token):**
```json
{
  "meal": { ... },
  "timeline": { ... },
  "tasks": [ ... ]
}
```

**Response (expired/invalid):**
```json
{ "error": "expired", "message": "This share link has expired" }
```

---

## UI Changes

### Meal Detail Page (/meals/[id])

Add "Share" button that:
1. Calls POST /api/share with meal ID
2. Shows modal with shareable link
3. Includes copy-to-clipboard functionality
4. Shows expiration info

---

## Task Breakdown

1. **Migration** - Create `meal_share_tokens` table
2. **RLS Policies** - Public read for valid tokens, host manage
3. **Types** - ShareToken, ShareLinkResult schemas
4. **Service** - generateLink, validateToken, getShareData, revokeLink
5. **POST /api/share** - Generate and return share link
6. **GET /api/share/[token]** - Validate and return meal data
7. **Share Button** - Add to meal detail page with modal

---

## Files to Create

```
supabase/migrations/
└── 20260104000001_create_share_tokens.sql

src/types/
└── share.ts                    # ShareToken types + Zod schemas

src/lib/services/share/
├── index.ts
└── supabase-share-service.ts

src/app/api/share/
├── route.ts                    # POST: generate link
└── [token]/route.ts            # GET: validate + return data

src/components/share/
├── index.ts
└── share-modal.tsx             # Copy link modal

src/app/meals/[id]/
└── page.tsx                    # ADD: Share button
```

---

## Week 8 Handoff

After Week 7, the following will be ready for the share viewer implementation:
- Database schema for tokens
- Token generation and validation
- API routes returning meal/timeline data
- Share button generating links

Week 8 will build:
- /share/[token] page (viewer route)
- Polling for live updates
- Mobile-responsive read-only view
