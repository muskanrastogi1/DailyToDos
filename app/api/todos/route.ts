import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('session_id')
  if (!sessionId) {
    return NextResponse.json({ data: [], error: null })
  }

  const db = getDb()
  const rows = db.prepare(
    'SELECT * FROM todos WHERE session_id = ? ORDER BY created_at ASC'
  ).all(sessionId)

  // Map integer completed back to boolean for the client
  const data = (rows as Record<string, unknown>[]).map((r) => ({
    ...r,
    completed: !!r.completed,
  }))

  return NextResponse.json({ data, error: null })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { action, record, ids } = body as {
    action: 'upsert' | 'delete' | 'delete_many'
    record?: Record<string, unknown>
    ids?: string[]
  }

  const db = getDb()

  if (action === 'upsert' && record) {
    const now = new Date().toISOString()
    const existing = db.prepare('SELECT id FROM todos WHERE id = ?').get(record.id)

    if (existing) {
      db.prepare(`
        UPDATE todos SET text = ?, completed = ?, completed_at = ?, notes = ?,
          timer_duration = ?, priority = ?, recurring = ?, streak = ?,
          subtasks = ?, category = ?, snoozed_until = ?, status = ?,
          session_id = ?, updated_at = ?
        WHERE id = ?
      `).run(
        record.text, record.completed ? 1 : 0, record.completed_at ?? null,
        record.notes ?? null, record.timer_duration ?? null,
        record.priority ?? null, record.recurring ?? null, record.streak ?? 0,
        record.subtasks ?? null, record.category ?? null,
        record.snoozed_until ?? null, record.status ?? 'active',
        record.session_id, now, record.id
      )
    } else {
      db.prepare(`
        INSERT INTO todos (id, text, completed, completed_at, notes, timer_duration, priority, recurring, streak, subtasks, category, snoozed_until, status, session_id, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        record.id, record.text, record.completed ? 1 : 0,
        record.completed_at ?? null, record.notes ?? null,
        record.timer_duration ?? null, record.priority ?? null,
        record.recurring ?? null, record.streak ?? 0,
        record.subtasks ?? null, record.category ?? null,
        record.snoozed_until ?? null, record.status ?? 'active',
        record.session_id, now, now
      )
    }

    return NextResponse.json({ error: null })
  }

  if (action === 'delete' && record?.id) {
    db.prepare('DELETE FROM todos WHERE id = ?').run(record.id)
    return NextResponse.json({ error: null })
  }

  if (action === 'delete_many' && ids) {
    const placeholders = ids.map(() => '?').join(',')
    db.prepare(`DELETE FROM todos WHERE id IN (${placeholders})`).run(...ids)
    return NextResponse.json({ error: null })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
