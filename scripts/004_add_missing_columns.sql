-- Add missing columns that the frontend writes to but don't exist in Supabase yet

ALTER TABLE public.todos ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT NULL;
ALTER TABLE public.todos ADD COLUMN IF NOT EXISTS recurring TEXT DEFAULT NULL;
ALTER TABLE public.todos ADD COLUMN IF NOT EXISTS streak INTEGER DEFAULT 0;
ALTER TABLE public.todos ADD COLUMN IF NOT EXISTS subtasks TEXT DEFAULT NULL;
ALTER TABLE public.todos ADD COLUMN IF NOT EXISTS category TEXT DEFAULT NULL;
ALTER TABLE public.todos ADD COLUMN IF NOT EXISTS snoozed_until TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE public.todos ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
