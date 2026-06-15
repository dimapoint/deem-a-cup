# Data Model Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Corregir inconsistencias de FK en el esquema existente y agregar tablas para activity feed, comentarios en deems, y notificaciones.

**Architecture:** SQL migrations aplicadas en Supabase + nuevos Server Actions extraídos como helpers con inyección de cliente (para testabilidad) + actualizaciones a los actions existentes para insertar en `activities` y `notifications` después de cada mutación.

**Tech Stack:** Bun, Next.js 15 App Router, Supabase (SSR client via `@supabase/ssr`), TypeScript

---

## File Map

| Archivo | Acción | Responsabilidad |
|---|---|---|
| `db_schema.sql` | Modificar | Agregar todas las migraciones SQL |
| `src/types/database.ts` | Modificar | Agregar tipos para Activity, DeemComment, Notification |
| `src/test/setup.ts` | Crear | Setup mínimo para Bun test runner |
| `src/app/actions/activity.ts` | Crear | Helper `insertActivity()` — reutilizado por otros actions |
| `src/app/actions/notifications.ts` | Crear | Helpers para notificaciones y lectura del inbox |
| `src/app/actions/comments.ts` | Crear | `addDeemComment()` y `getDeemComments()` |
| `src/app/actions/feed.ts` | Crear | `getFeedActivities()` — feed social paginado |
| `src/app/actions/deem.ts` | Modificar | Llamar `insertActivity()` después de `logCoffee()` |
| `src/app/actions/social.ts` | Modificar | Llamar activity + notification después de `followUser()` |
| `src/app/actions/lists.ts` | Modificar | Llamar `insertActivity()` después de `createList()` |
| `src/app/actions/photos.ts` | Modificar | Llamar `insertActivity()` después de `uploadCafePhoto()` |

---

## Task 1: SQL Migration — Corregir FKs inconsistentes

**Files:**
- Modify: `db_schema.sql`

Agregar al final de `db_schema.sql` las siguientes migraciones. Luego ejecutarlas en el Supabase SQL editor (Dashboard → SQL Editor).

- [ ] **Step 1: Agregar migraciones al schema**

Abrir `db_schema.sql` y agregar al final:

```sql
-- ===== MIGRATION: Fix FK inconsistencies =====

-- Fix watchlist.user_id: was referencing auth.users, now references profiles(id)
-- Drop and recreate the FK constraint.
ALTER TABLE watchlist
  DROP CONSTRAINT IF EXISTS watchlist_user_id_fkey;

ALTER TABLE watchlist
  ADD CONSTRAINT watchlist_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Fix photo_likes.user_id: was referencing auth.users, now references profiles(id)
ALTER TABLE photo_likes
  DROP CONSTRAINT IF EXISTS photo_likes_user_id_fkey;

ALTER TABLE photo_likes
  ADD CONSTRAINT photo_likes_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

NOTIFY pgrst, 'reload schema';
```

- [ ] **Step 2: Ejecutar en Supabase SQL Editor**

Copiar el bloque anterior y ejecutarlo en Supabase Dashboard → SQL Editor.
Resultado esperado: `Success. No rows returned.`

- [ ] **Step 3: Commit**

```bash
git add db_schema.sql
git commit -m "fix: correct FK references in watchlist and photo_likes to point to profiles(id)"
```

---

## Task 2: SQL Migration — Nuevas tablas, funciones e índices

**Files:**
- Modify: `db_schema.sql`

- [ ] **Step 1: Agregar tabla `activities` al schema**

Agregar al final de `db_schema.sql`:

```sql
-- ===== MIGRATION: Table activities =====

CREATE TABLE IF NOT EXISTS activities (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id    uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  verb        text        NOT NULL,
  -- verb values: 'deem' | 'list_created' | 'list_updated' | 'followed' | 'photo_uploaded'
  object_id   uuid        NOT NULL,
  object_type text        NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Activities are viewable by everyone" ON activities;
CREATE POLICY "Activities are viewable by everyone"
  ON activities FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own activities" ON activities;
CREATE POLICY "Users can insert their own activities"
  ON activities FOR INSERT
  WITH CHECK (auth.uid() = actor_id);

DROP POLICY IF EXISTS "Users can delete their own activities" ON activities;
CREATE POLICY "Users can delete their own activities"
  ON activities FOR DELETE
  USING (auth.uid() = actor_id);

CREATE INDEX IF NOT EXISTS idx_activities_actor_created
  ON activities(actor_id, created_at DESC);

NOTIFY pgrst, 'reload schema';
```

- [ ] **Step 2: Agregar tabla `deem_comments` al schema**

```sql
-- ===== MIGRATION: Table deem_comments =====

CREATE TABLE IF NOT EXISTS deem_comments (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  deem_id    uuid        NOT NULL REFERENCES deems(id) ON DELETE CASCADE,
  user_id    uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content    text        NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE deem_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Deem comments are viewable by everyone" ON deem_comments;
CREATE POLICY "Deem comments are viewable by everyone"
  ON deem_comments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own comments" ON deem_comments;
CREATE POLICY "Users can insert their own comments"
  ON deem_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own comments" ON deem_comments;
CREATE POLICY "Users can delete their own comments"
  ON deem_comments FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_deem_comments_deem
  ON deem_comments(deem_id, created_at ASC);

NOTIFY pgrst, 'reload schema';
```

- [ ] **Step 3: Agregar tabla `notifications` y funciones SECURITY DEFINER**

```sql
-- ===== MIGRATION: Table notifications =====

CREATE TABLE IF NOT EXISTS notifications (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  actor_id    uuid        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type        text        NOT NULL,
  -- type values: 'new_deem' | 'new_comment' | 'new_follow' | 'new_photo'
  object_id   uuid        NOT NULL,
  object_type text        NOT NULL,
  read        boolean     NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read their own notifications" ON notifications;
CREATE POLICY "Users can read their own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can mark their notifications as read" ON notifications;
CREATE POLICY "Users can mark their notifications as read"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own notifications" ON notifications;
CREATE POLICY "Users can delete their own notifications"
  ON notifications FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user_read
  ON notifications(user_id, read, created_at DESC);

-- Function: insert a single notification (bypasses INSERT RLS)
CREATE OR REPLACE FUNCTION insert_notification(
  p_user_id    uuid,
  p_actor_id   uuid,
  p_type       text,
  p_object_id  uuid,
  p_object_type text
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO notifications (user_id, actor_id, type, object_id, object_type)
  VALUES (p_user_id, p_actor_id, p_type, p_object_id, p_object_type);
END;
$$;

-- Function: bulk-insert notifications for all followers of an actor
CREATE OR REPLACE FUNCTION insert_notifications_for_followers(
  p_actor_id    uuid,
  p_type        text,
  p_object_id   uuid,
  p_object_type text
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO notifications (user_id, actor_id, type, object_id, object_type)
  SELECT f.follower_id, p_actor_id, p_type, p_object_id, p_object_type
  FROM follows f
  WHERE f.following_id = p_actor_id
    AND f.follower_id != p_actor_id;
END;
$$;

NOTIFY pgrst, 'reload schema';
```

- [ ] **Step 4: Ejecutar los tres bloques en Supabase SQL Editor**

Ejecutar cada bloque por separado (activities → deem_comments → notifications).
Resultado esperado para cada uno: `Success. No rows returned.`

- [ ] **Step 5: Commit**

```bash
git add db_schema.sql
git commit -m "feat: add activities, deem_comments and notifications tables with RLS and SECURITY DEFINER functions"
```

---

## Task 3: Agregar tipos TypeScript

**Files:**
- Modify: `src/types/database.ts`

- [ ] **Step 1: Agregar interfaces al final de `src/types/database.ts`**

```typescript
export interface Activity {
  id: string
  actor_id: string
  verb: 'deem' | 'list_created' | 'list_updated' | 'followed' | 'photo_uploaded'
  object_id: string
  object_type: 'deem' | 'list' | 'follow' | 'photo'
  created_at: string
}

export interface ActivityInsert {
  actor_id: string
  verb: Activity['verb']
  object_id: string
  object_type: Activity['object_type']
}

export interface DeemComment {
  id: string
  deem_id: string
  user_id: string
  content: string
  created_at: string
}

export interface DeemCommentInsert {
  deem_id: string
  user_id: string
  content: string
}

export interface Notification {
  id: string
  user_id: string
  actor_id: string
  type: 'new_deem' | 'new_comment' | 'new_follow' | 'new_photo' | 'new_list'
  object_id: string
  object_type: string
  read: boolean
  created_at: string
}
```

- [ ] **Step 2: Verificar que TypeScript compila sin errores**

```bash
bun run build 2>&1 | head -30
```

Resultado esperado: build exitoso o solo errores pre-existentes (no errores en `database.ts`).

- [ ] **Step 3: Commit**

```bash
git add src/types/database.ts
git commit -m "feat: add TypeScript types for Activity, DeemComment and Notification"
```

---

## Task 4: Crear setup de tests

**Files:**
- Create: `src/test/setup.ts`

- [ ] **Step 1: Crear el archivo de setup**

```typescript
// src/test/setup.ts
// Preloaded by Bun test runner (see bunfig.toml).
// Add global test setup here as needed.
```

- [ ] **Step 2: Verificar que `bun test` corre sin error**

```bash
bun test
```

Resultado esperado: `0 tests` o tests vacíos — sin errores de runtime.

- [ ] **Step 3: Commit**

```bash
git add src/test/setup.ts
git commit -m "chore: add bun test setup file"
```

---

## Task 5: Crear `src/app/actions/activity.ts`

**Files:**
- Create: `src/test/actions/activity.test.ts`
- Create: `src/app/actions/activity.ts`

- [ ] **Step 1: Escribir el test que falla**

Crear `src/test/actions/activity.test.ts`:

```typescript
import {describe, it, expect, mock} from 'bun:test'
import {insertActivity} from '@/app/actions/activity'
import type {SupabaseClient} from '@supabase/supabase-js'

function makeMockSupabase(insertResult = {error: null}) {
  const mockInsert = mock(() => Promise.resolve(insertResult))
  const mockFrom = mock(() => ({insert: mockInsert}))
  return {supabase: {from: mockFrom} as unknown as SupabaseClient, mockFrom, mockInsert}
}

describe('insertActivity', () => {
  it('inserts a row in the activities table with the correct fields', async () => {
    const {supabase, mockFrom, mockInsert} = makeMockSupabase()

    await insertActivity(supabase, 'actor-1', 'deem', 'deem-1', 'deem')

    expect(mockFrom).toHaveBeenCalledWith('activities')
    expect(mockInsert).toHaveBeenCalledWith({
      actor_id: 'actor-1',
      verb: 'deem',
      object_id: 'deem-1',
      object_type: 'deem',
    })
  })

  it('throws if Supabase returns an error', async () => {
    const {supabase} = makeMockSupabase({error: {message: 'DB error'}} as any)

    expect(insertActivity(supabase, 'a', 'deem', 'b', 'deem')).rejects.toThrow('DB error')
  })
})
```

- [ ] **Step 2: Verificar que el test falla**

```bash
bun test src/test/actions/activity.test.ts
```

Resultado esperado: `Cannot find module '@/app/actions/activity'`

- [ ] **Step 3: Implementar `insertActivity`**

Crear `src/app/actions/activity.ts`:

```typescript
'use server'

import type {SupabaseClient} from '@supabase/supabase-js'
import type {Activity} from '@/types/database'

export async function insertActivity(
  supabase: SupabaseClient,
  actorId: string,
  verb: Activity['verb'],
  objectId: string,
  objectType: Activity['object_type']
): Promise<void> {
  const {error} = await supabase.from('activities').insert({
    actor_id: actorId,
    verb,
    object_id: objectId,
    object_type: objectType,
  })

  if (error) {
    console.error('Error inserting activity:', error)
    throw new Error(error.message)
  }
}
```

- [ ] **Step 4: Verificar que el test pasa**

```bash
bun test src/test/actions/activity.test.ts
```

Resultado esperado: `2 pass, 0 fail`

- [ ] **Step 5: Commit**

```bash
git add src/app/actions/activity.ts src/test/actions/activity.test.ts
git commit -m "feat: add insertActivity helper with tests"
```

---

## Task 6: Crear `src/app/actions/notifications.ts`

**Files:**
- Create: `src/test/actions/notifications.test.ts`
- Create: `src/app/actions/notifications.ts`

- [ ] **Step 1: Escribir los tests que fallan**

Crear `src/test/actions/notifications.test.ts`:

```typescript
import {describe, it, expect, mock} from 'bun:test'
import {
  insertNotificationsForFollowers,
  insertNotificationForUser,
} from '@/app/actions/notifications'
import type {SupabaseClient} from '@supabase/supabase-js'

function makeMockRpc(result = {error: null}) {
  const mockRpc = mock(() => Promise.resolve(result))
  return {supabase: {rpc: mockRpc} as unknown as SupabaseClient, mockRpc}
}

describe('insertNotificationsForFollowers', () => {
  it('calls insert_notifications_for_followers RPC with correct params', async () => {
    const {supabase, mockRpc} = makeMockRpc()

    await insertNotificationsForFollowers(supabase, 'actor-1', 'new_deem', 'deem-1', 'deem')

    expect(mockRpc).toHaveBeenCalledWith('insert_notifications_for_followers', {
      p_actor_id: 'actor-1',
      p_type: 'new_deem',
      p_object_id: 'deem-1',
      p_object_type: 'deem',
    })
  })

  it('throws if RPC returns an error', async () => {
    const {supabase} = makeMockRpc({error: {message: 'RPC error'}} as any)

    expect(
      insertNotificationsForFollowers(supabase, 'a', 'new_deem', 'b', 'deem')
    ).rejects.toThrow('RPC error')
  })
})

describe('insertNotificationForUser', () => {
  it('calls insert_notification RPC with correct params', async () => {
    const {supabase, mockRpc} = makeMockRpc()

    await insertNotificationForUser(supabase, 'user-1', 'actor-1', 'new_comment', 'deem-1', 'deem')

    expect(mockRpc).toHaveBeenCalledWith('insert_notification', {
      p_user_id: 'user-1',
      p_actor_id: 'actor-1',
      p_type: 'new_comment',
      p_object_id: 'deem-1',
      p_object_type: 'deem',
    })
  })
})
```

- [ ] **Step 2: Verificar que los tests fallan**

```bash
bun test src/test/actions/notifications.test.ts
```

Resultado esperado: `Cannot find module '@/app/actions/notifications'`

- [ ] **Step 3: Implementar notifications**

Crear `src/app/actions/notifications.ts`:

```typescript
'use server'

import {createClient} from '@/utils/supabase/server'
import type {SupabaseClient} from '@supabase/supabase-js'
import type {Notification} from '@/types/database'
import {revalidatePath} from 'next/cache'

// ── Helpers (inyectan el cliente para testabilidad) ──────────────────────────

export async function insertNotificationsForFollowers(
  supabase: SupabaseClient,
  actorId: string,
  type: Notification['type'],
  objectId: string,
  objectType: string
): Promise<void> {
  const {error} = await supabase.rpc('insert_notifications_for_followers', {
    p_actor_id: actorId,
    p_type: type,
    p_object_id: objectId,
    p_object_type: objectType,
  })

  if (error) {
    console.error('Error inserting notifications for followers:', error)
    throw new Error(error.message)
  }
}

export async function insertNotificationForUser(
  supabase: SupabaseClient,
  userId: string,
  actorId: string,
  type: Notification['type'],
  objectId: string,
  objectType: string
): Promise<void> {
  const {error} = await supabase.rpc('insert_notification', {
    p_user_id: userId,
    p_actor_id: actorId,
    p_type: type,
    p_object_id: objectId,
    p_object_type: objectType,
  })

  if (error) {
    console.error('Error inserting notification:', error)
    throw new Error(error.message)
  }
}

// ── Server Actions ────────────────────────────────────────────────────────────

export type NotificationWithActor = Notification & {
  actor: {
    username: string | null
    full_name: string | null
    avatar_url: string | null
  }
}

export async function getNotifications(): Promise<NotificationWithActor[]> {
  const supabase = await createClient()
  const {data: {user}} = await supabase.auth.getUser()
  if (!user) return []

  const {data, error} = await supabase
    .from('notifications')
    .select(`
      *,
      actor:profiles!actor_id(username, full_name, avatar_url)
    `)
    .eq('user_id', user.id)
    .order('created_at', {ascending: false})
    .limit(50)

  if (error) {
    console.error('Error fetching notifications:', error)
    return []
  }

  return data as NotificationWithActor[]
}

export async function markNotificationRead(notificationId: string): Promise<void> {
  const supabase = await createClient()
  const {data: {user}} = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const {error} = await supabase
    .from('notifications')
    .update({read: true})
    .eq('id', notificationId)
    .eq('user_id', user.id)

  if (error) throw new Error(error.message)
  revalidatePath('/profile')
}
```

- [ ] **Step 4: Verificar que los tests pasan**

```bash
bun test src/test/actions/notifications.test.ts
```

Resultado esperado: `3 pass, 0 fail`

- [ ] **Step 5: Commit**

```bash
git add src/app/actions/notifications.ts src/test/actions/notifications.test.ts
git commit -m "feat: add notification helpers (insertNotificationsForFollowers, insertNotificationForUser, getNotifications, markNotificationRead)"
```

---

## Task 7: Crear `src/app/actions/comments.ts`

**Files:**
- Create: `src/test/actions/comments.test.ts`
- Create: `src/app/actions/comments.ts`

- [ ] **Step 1: Escribir el test que falla**

Crear `src/test/actions/comments.test.ts`:

```typescript
import {describe, it, expect, mock} from 'bun:test'
import {buildCommentInsert} from '@/app/actions/comments'

describe('buildCommentInsert', () => {
  it('returns insert payload with userId and deemId', () => {
    const result = buildCommentInsert('deem-1', 'user-1', 'great coffee!')
    expect(result).toEqual({
      deem_id: 'deem-1',
      user_id: 'user-1',
      content: 'great coffee!',
    })
  })

  it('throws if content is empty', () => {
    expect(() => buildCommentInsert('deem-1', 'user-1', '  ')).toThrow('Content is required')
  })
})
```

- [ ] **Step 2: Verificar que el test falla**

```bash
bun test src/test/actions/comments.test.ts
```

Resultado esperado: `Cannot find module '@/app/actions/comments'`

- [ ] **Step 3: Implementar comments**

Crear `src/app/actions/comments.ts`:

```typescript
'use server'

import {createClient} from '@/utils/supabase/server'
import type {DeemComment, DeemCommentInsert, Profile} from '@/types/database'
import {revalidatePath} from 'next/cache'
import {insertNotificationForUser} from '@/app/actions/notifications'

// ── Pure helper (testable) ───────────────────────────────────────────────────

export function buildCommentInsert(
  deemId: string,
  userId: string,
  content: string
): DeemCommentInsert {
  const trimmed = content.trim()
  if (!trimmed) throw new Error('Content is required')
  return {deem_id: deemId, user_id: userId, content: trimmed}
}

// ── Server Actions ────────────────────────────────────────────────────────────

export type DeemCommentWithAuthor = DeemComment & {
  author: Pick<Profile, 'username' | 'full_name' | 'avatar_url'>
}

export async function addDeemComment(deemId: string, content: string): Promise<void> {
  const supabase = await createClient()
  const {data: {user}} = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const payload = buildCommentInsert(deemId, user.id, content)

  const {error} = await supabase.from('deem_comments').insert(payload)
  if (error) throw new Error(error.message)

  // Notify the deem author (if different from commenter)
  const {data: deem} = await supabase
    .from('deems')
    .select('user_id')
    .eq('id', deemId)
    .single()

  if (deem && deem.user_id !== user.id) {
    await insertNotificationForUser(
      supabase,
      deem.user_id,
      user.id,
      'new_comment',
      deemId,
      'deem'
    )
  }

  revalidatePath('/')
}

export async function getDeemComments(deemId: string): Promise<DeemCommentWithAuthor[]> {
  const supabase = await createClient()

  const {data, error} = await supabase
    .from('deem_comments')
    .select(`
      *,
      author:profiles!user_id(username, full_name, avatar_url)
    `)
    .eq('deem_id', deemId)
    .order('created_at', {ascending: true})

  if (error) {
    console.error('Error fetching comments:', error)
    return []
  }

  return data as DeemCommentWithAuthor[]
}
```

- [ ] **Step 4: Verificar que los tests pasan**

```bash
bun test src/test/actions/comments.test.ts
```

Resultado esperado: `2 pass, 0 fail`

- [ ] **Step 5: Commit**

```bash
git add src/app/actions/comments.ts src/test/actions/comments.test.ts
git commit -m "feat: add deem comments (addDeemComment, getDeemComments) with notification to deem author"
```

---

## Task 8: Crear `src/app/actions/feed.ts`

**Files:**
- Create: `src/app/actions/feed.ts`

No hay lógica pura testable acá — es una query de Supabase directa. El test sería de integración.

- [ ] **Step 1: Implementar `getFeedActivities`**

Crear `src/app/actions/feed.ts`:

```typescript
'use server'

import {createClient} from '@/utils/supabase/server'
import type {Activity, Profile} from '@/types/database'

export type ActivityWithActor = Activity & {
  actor: Pick<Profile, 'id' | 'username' | 'full_name' | 'avatar_url'>
}

export async function getFeedActivities(limit = 20): Promise<ActivityWithActor[]> {
  const supabase = await createClient()
  const {data: {user}} = await supabase.auth.getUser()
  if (!user) return []

  // Get IDs of users this user follows
  const {data: followingRows, error: followError} = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', user.id)

  if (followError || !followingRows?.length) return []

  const followingIds = followingRows.map((f) => f.following_id)

  const {data, error} = await supabase
    .from('activities')
    .select(`
      *,
      actor:profiles!actor_id(id, username, full_name, avatar_url)
    `)
    .in('actor_id', followingIds)
    .order('created_at', {ascending: false})
    .limit(limit)

  if (error) {
    console.error('Error fetching feed activities:', error)
    return []
  }

  return data as ActivityWithActor[]
}
```

- [ ] **Step 2: Verificar que TypeScript compila**

```bash
bun run build 2>&1 | head -30
```

Resultado esperado: sin errores nuevos.

- [ ] **Step 3: Commit**

```bash
git add src/app/actions/feed.ts
git commit -m "feat: add getFeedActivities for social feed"
```

---

## Task 9: Actualizar `deem.ts` — insertar activity

**Files:**
- Modify: `src/app/actions/deem.ts`

- [ ] **Step 1: Agregar import de `insertActivity`**

En `src/app/actions/deem.ts`, agregar al bloque de imports:

```typescript
import {insertActivity} from '@/app/actions/activity'
```

- [ ] **Step 2: Modificar `saveDeem` para retornar el ID del deem insertado**

Reemplazar la función `saveDeem` existente (líneas 78-85):

```typescript
async function saveDeem(supabase: SupabaseClient, deemData: DeemInsert): Promise<string> {
  const {data, error} = await supabase.from('deems').insert(deemData).select('id').single()

  if (error) {
    console.error('Error logging coffee:', error)
    throw new Error(error.message || 'Error saving visit')
  }
  return data.id
}
```

- [ ] **Step 3: Agregar import de `insertNotificationsForFollowers`**

En `src/app/actions/deem.ts`, agregar al bloque de imports:

```typescript
import {insertNotificationsForFollowers} from '@/app/actions/notifications'
```

- [ ] **Step 4: Modificar `logCoffee` para insertar la activity y las notificaciones**

Reemplazar el cuerpo de `logCoffee` (líneas 186-192):

```typescript
export async function logCoffee(formData: FormData) {
  const supabase = await createClient()
  const user = await getUserOrThrow(supabase)
  const deemData = extractDeemData(formData, user.id)
  const deemId = await saveDeem(supabase, deemData)

  // Fire-and-forget: don't fail logCoffee if side-effects fail
  Promise.all([
    insertActivity(supabase, user.id, 'deem', deemId, 'deem'),
    insertNotificationsForFollowers(supabase, user.id, 'new_deem', deemId, 'deem'),
  ]).catch((e) => console.error('Activity/notification insert failed:', e))

  revalidatePath('/')
}
```

- [ ] **Step 4: Verificar que TypeScript compila**

```bash
bun run build 2>&1 | head -30
```

Resultado esperado: sin errores nuevos.

- [ ] **Step 5: Commit**

```bash
git add src/app/actions/deem.ts
git commit -m "feat: insert activity after logging a deem"
```

---

## Task 10: Actualizar `social.ts` — insertar activity y notification

**Files:**
- Modify: `src/app/actions/social.ts`

- [ ] **Step 1: Agregar imports**

En `src/app/actions/social.ts`, agregar al bloque de imports:

```typescript
import {insertActivity} from '@/app/actions/activity'
import {insertNotificationForUser} from '@/app/actions/notifications'
```

- [ ] **Step 2: Actualizar `followUser`**

Después de la inserción en `follows` (después de la línea `if (error) { throw... }`), agregar antes del bloque de `revalidatePath`:

```typescript
  // Fire-and-forget: don't fail followUser if side-effects fail
  Promise.all([
    insertActivity(supabase, user.id, 'followed', followingId, 'follow'),
    insertNotificationForUser(supabase, followingId, user.id, 'new_follow', followingId, 'follow'),
  ]).catch((e) => console.error('Activity/notification insert failed:', e))
```

El bloque completo de `followUser` queda:

```typescript
export async function followUser(followingId: string) {
  const supabase = await createClient()
  const {data: {user}} = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  const {error} = await supabase.from('follows').insert({
    follower_id: user.id,
    following_id: followingId,
  })

  if (error) {
    console.error('Error following user:', error)
    throw new Error('Failed to follow user')
  }

  Promise.all([
    insertActivity(supabase, user.id, 'followed', followingId, 'follow'),
    insertNotificationForUser(supabase, followingId, user.id, 'new_follow', followingId, 'follow'),
  ]).catch((e) => console.error('Activity/notification insert failed:', e))

  const {data: profile} = await supabase
    .from('profiles')
    .select('username')
    .eq('id', followingId)
    .single()

  if (profile?.username) {
    revalidatePath(`/u/${profile.username}`)
  }
  revalidatePath(`/profile`)
}
```

- [ ] **Step 3: Verificar que TypeScript compila**

```bash
bun run build 2>&1 | head -30
```

Resultado esperado: sin errores nuevos.

- [ ] **Step 4: Commit**

```bash
git add src/app/actions/social.ts
git commit -m "feat: insert activity and notification after following a user"
```

---

## Task 11: Actualizar `lists.ts` — insertar activity

**Files:**
- Modify: `src/app/actions/lists.ts`

- [ ] **Step 1: Agregar imports**

En `src/app/actions/lists.ts`, agregar al bloque de imports:

```typescript
import {insertActivity} from '@/app/actions/activity'
import {insertNotificationsForFollowers} from '@/app/actions/notifications'
```

- [ ] **Step 2: Modificar `createList` para capturar el id y lanzar activity + notificaciones**

Reemplazar el bloque de insert en `createList` (el `const {error} = await supabase.from('lists').insert({...})`):

```typescript
  const {data: newList, error} = await supabase
    .from('lists')
    .insert({
      user_id: user.id,
      title,
      description: description || null,
      is_ranked: isRanked,
    })
    .select('id')
    .single()

  if (error) {
    console.error('Error creating list:', error)
    throw new Error('Failed to create list')
  }

  Promise.all([
    insertActivity(supabase, user.id, 'list_created', newList.id, 'list'),
    insertNotificationsForFollowers(supabase, user.id, 'new_list', newList.id, 'list'),
  ]).catch((e) => console.error('Activity/notification insert failed:', e))
```

- [ ] **Step 3: Verificar que TypeScript compila**

```bash
bun run build 2>&1 | head -30
```

Resultado esperado: sin errores nuevos.

- [ ] **Step 4: Commit**

```bash
git add src/app/actions/lists.ts
git commit -m "feat: insert activity after creating a list"
```

---

## Task 12: Actualizar `photos.ts` — insertar activity

**Files:**
- Modify: `src/app/actions/photos.ts`

- [ ] **Step 1: Agregar imports**

En `src/app/actions/photos.ts`, agregar al bloque de imports:

```typescript
import {insertActivity} from '@/app/actions/activity'
import {insertNotificationsForFollowers} from '@/app/actions/notifications'
```

- [ ] **Step 2: Modificar `uploadCafePhoto` para capturar el id y lanzar activity + notificaciones**

Reemplazar el bloque de insert en `uploadCafePhoto` (el `const {error: dbError} = await supabase.from('cafe_photos').insert({...})`):

```typescript
  const {data: photoRow, error: dbError} = await supabase
    .from('cafe_photos')
    .insert({
      cafe_id: cafeId,
      user_id: user.id,
      url: publicUrlData.publicUrl,
      caption: caption || null,
    })
    .select('id')
    .single()

  if (dbError) {
    console.error('Error saving photo metadata:', dbError)
    throw new Error('Failed to save photo info')
  }

  Promise.all([
    insertActivity(supabase, user.id, 'photo_uploaded', photoRow.id, 'photo'),
    insertNotificationsForFollowers(supabase, user.id, 'new_photo', photoRow.id, 'photo'),
  ]).catch((e) => console.error('Activity/notification insert failed:', e))
```

- [ ] **Step 3: Verificar que TypeScript compila**

```bash
bun run build 2>&1 | head -30
```

Resultado esperado: sin errores nuevos.

- [ ] **Step 4: Verificar que todos los tests pasan**

```bash
bun test
```

Resultado esperado: todos los tests en green.

- [ ] **Step 5: Commit final**

```bash
git add src/app/actions/photos.ts
git commit -m "feat: insert activity after uploading a cafe photo"
```

---

## Resumen de commits esperados

1. `fix: correct FK references in watchlist and photo_likes to point to profiles(id)`
2. `feat: add activities, deem_comments and notifications tables with RLS and SECURITY DEFINER functions`
3. `feat: add TypeScript types for Activity, DeemComment and Notification`
4. `chore: add bun test setup file`
5. `feat: add insertActivity helper with tests`
6. `feat: add notification helpers (...)`
7. `feat: add deem comments (...) with notification to deem author`
8. `feat: add getFeedActivities for social feed`
9. `feat: insert activity after logging a deem`
10. `feat: insert activity and notification after following a user`
11. `feat: insert activity after creating a list`
12. `feat: insert activity after uploading a cafe photo`
