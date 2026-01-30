-- Add completed_at column to track when tasks were completed
ALTER TABLE todos ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- Update existing completed tasks to have completed_at set to their created_at
UPDATE todos SET completed_at = created_at WHERE completed = true AND completed_at IS NULL;
