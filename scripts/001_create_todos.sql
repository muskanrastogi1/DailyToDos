-- Create todos table
CREATE TABLE IF NOT EXISTS public.todos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  timer_duration INTEGER,
  celebrity_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_id TEXT NOT NULL
);

-- Create index on session_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_todos_session_id ON public.todos(session_id);

-- Create index on created_at for ordering
CREATE INDEX IF NOT EXISTS idx_todos_created_at ON public.todos(created_at);

-- Enable Row Level Security
ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read, insert, update, delete todos based on session_id
-- This allows anonymous users to manage their own todos
CREATE POLICY "Allow all operations for session" ON public.todos
  FOR ALL
  USING (true)
  WITH CHECK (true);
