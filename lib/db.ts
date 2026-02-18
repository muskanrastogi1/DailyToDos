import Database from 'better-sqlite3'
import path from 'path'

const DB_PATH = path.join(process.cwd(), 'local.db')

let db: Database.Database | null = null

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH)
    db.pragma('journal_mode = WAL')
    db.exec(`
      CREATE TABLE IF NOT EXISTS todos (
        id TEXT PRIMARY KEY,
        text TEXT NOT NULL,
        completed INTEGER DEFAULT 0,
        completed_at TEXT,
        notes TEXT,
        timer_duration INTEGER,
        session_id TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      );
      CREATE INDEX IF NOT EXISTS idx_todos_session_id ON todos(session_id);
      CREATE INDEX IF NOT EXISTS idx_todos_created_at ON todos(created_at);
    `)

    // Migrations: add columns if they don't exist
    const columns = db.prepare("PRAGMA table_info(todos)").all() as { name: string }[]
    if (!columns.some(c => c.name === 'priority')) {
      db.exec('ALTER TABLE todos ADD COLUMN priority INTEGER')
    }
    if (!columns.some(c => c.name === 'recurring')) {
      db.exec('ALTER TABLE todos ADD COLUMN recurring TEXT')
    }
    if (!columns.some(c => c.name === 'streak')) {
      db.exec('ALTER TABLE todos ADD COLUMN streak INTEGER DEFAULT 0')
    }
    if (!columns.some(c => c.name === 'subtasks')) {
      db.exec('ALTER TABLE todos ADD COLUMN subtasks TEXT')
    }
    if (!columns.some(c => c.name === 'category')) {
      db.exec('ALTER TABLE todos ADD COLUMN category TEXT')
    }
    if (!columns.some(c => c.name === 'snoozed_until')) {
      db.exec('ALTER TABLE todos ADD COLUMN snoozed_until TEXT')
    }
    if (!columns.some(c => c.name === 'status')) {
      db.exec("ALTER TABLE todos ADD COLUMN status TEXT DEFAULT 'active'")
    }
  }
  return db
}
