-- Add notes column to todos table
ALTER TABLE public.todos
ADD COLUMN IF NOT EXISTS notes text DEFAULT NULL;
