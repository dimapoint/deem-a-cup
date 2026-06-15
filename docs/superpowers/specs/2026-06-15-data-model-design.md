# Data Model Design — deem-a-cup

**Date:** 2026-06-15
**Scope:** Schema fixes + social/activity feed features

---

## 1. Context

deem-a-cup is a Next.js 15 app (App Router) backed by Supabase. Users log coffee visits ("deems"), follow each other, create lists of cafés, and upload photos. The goal of this spec is to:

1. Fix FK inconsistencies in the existing schema.
2. Add an activity feed (deems, lists, follows, photos).
3. Add comments on deems.
4. Add a personal notification inbox.

---

## 2. Schema Fixes

Two tables incorrectly reference `auth.users` instead of `profiles(id)`, breaking JOIN consistency across the app.

| Table | Column | Current | Fix |
|---|---|---|---|
| `watchlist` | `user_id` | `auth.users` | `profiles(id) ON DELETE CASCADE` |
| `photo_likes` | `user_id` | `auth.users` | `profiles(id) ON DELETE CASCADE` |

All other tables (`deems`, `follows`, `lists`, `cafe_photos`) already reference `profiles(id)` correctly.

**Out of scope:**
- `liked boolean` in `deems` — kept as-is (independent "loved this place" flag).
- `favorite_cafe_ids uuid[]` in `profiles` — kept as-is (changing to a join table would break existing code; the max-3 constraint is intentional).

---

## 3. New Tables

### 3.1 `activities`

Powers the social feed. One row per user action.

```sql
CREATE TABLE activities (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id    uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  verb        text        NOT NULL,
  -- verb values: 'deem' | 'list_created' | 'list_updated' | 'followed' | 'photo_uploaded'
  object_id   uuid        NOT NULL,
  -- generic UUID; no typed FK. Type is implied by verb.
  object_type text        NOT NULL,
  -- 'deem' | 'list' | 'follow' | 'photo' — redundant with verb but useful on the client
  created_at  timestamptz NOT NULL DEFAULT now()
);
```

**Feed query:** All activities from users the current user follows, newest first:
```sql
SELECT a.*
FROM activities a
JOIN follows f ON f.following_id = a.actor_id
WHERE f.follower_id = $me
ORDER BY a.created_at DESC
LIMIT 20;
```

**Write pattern:** Server Actions insert into `activities` after the primary mutation (e.g., after inserting a deem, also insert an activity row with `verb = 'deem'`).

**RLS:**
- SELECT: viewable by everyone (feed filtering happens at the query level, not RLS — same pattern as `deems` and `follows`).
- INSERT: users can only insert their own activities (`actor_id = auth.uid()`).
- DELETE: users can delete their own activities.

---

### 3.2 `deem_comments`

Comments on deem entries.

```sql
CREATE TABLE deem_comments (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  deem_id    uuid        NOT NULL REFERENCES deems(id) ON DELETE CASCADE,
  user_id    uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content    text        NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
```

**RLS:**
- SELECT: viewable by everyone (comments are public, like deems).
- INSERT: authenticated users only, `user_id = auth.uid()`.
- DELETE: users can delete their own comments.

---

### 3.3 `notifications`

Personal inbox for each user. Generated server-side when an action targets a follower.

```sql
CREATE TABLE notifications (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE, -- recipient
  actor_id    uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE, -- who triggered it
  type        text        NOT NULL,
  -- type values: 'new_deem' | 'new_comment' | 'new_follow' | 'new_photo'
  object_id   uuid        NOT NULL,
  object_type text        NOT NULL,
  read        boolean     NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);
```

**Write pattern:** When a user (actor) performs an action, the Server Action queries `follows` to find all followers of that actor, then bulk-inserts notification rows for each follower. For `new_comment`, the notification goes to the deem author (not followers).

**RLS:**
- SELECT: users can only read their own notifications (`user_id = auth.uid()`).
- INSERT: via a `SECURITY DEFINER` SQL function (`insert_notification`) that bypasses RLS — called from Server Actions. This allows inserting notifications for other users without exposing the service role key to client code.
- UPDATE: users can mark their own notifications as read (`user_id = auth.uid()`).
- DELETE: users can delete their own notifications (`user_id = auth.uid()`).

---

## 4. Indexes

```sql
-- activities: feed query hits actor_id + created_at
CREATE INDEX idx_activities_actor_created ON activities(actor_id, created_at DESC);

-- deem_comments: fetching comments per deem
CREATE INDEX idx_deem_comments_deem ON deem_comments(deem_id, created_at ASC);

-- notifications: inbox query by recipient
CREATE INDEX idx_notifications_user_read ON notifications(user_id, read, created_at DESC);
```

---

## 5. Data Flow Summary

| User action | Primary mutation | Activity insert | Notification insert |
|---|---|---|---|
| Log a deem | `INSERT INTO deems` | `verb = 'deem'` | followers of actor |
| Create list | `INSERT INTO lists` | `verb = 'list_created'` | followers of actor |
| Update list | `UPDATE lists` | `verb = 'list_updated'` | followers of actor |
| Follow user | `INSERT INTO follows` | `verb = 'followed'` | the followed user |
| Upload photo | `INSERT INTO cafe_photos` | `verb = 'photo_uploaded'` | followers of actor |
| Comment deem | `INSERT INTO deem_comments` | — | deem author |

---

## 6. Migration Order

1. Fix `watchlist.user_id` FK → `profiles(id)`
2. Fix `photo_likes.user_id` FK → `profiles(id)`
3. Create `activities` table + RLS + index
4. Create `deem_comments` table + RLS + index
5. Create `notifications` table + RLS + index
6. Update Server Actions to insert `activities` + `notifications` rows
