/*
  # Fix users table structure

  1. Changes
    - Add missing `name` column to users table
    - Update role constraint to match expected values
    - Ensure all required columns exist

  2. Security
    - Maintain existing RLS policies
*/

-- Add missing columns to users table if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'name'
  ) THEN
    ALTER TABLE users ADD COLUMN name text;
  END IF;
END $$;

-- Update role constraint to match expected values
DO $$
BEGIN
  -- Drop existing constraint if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'users' AND constraint_name = 'users_role_check'
  ) THEN
    ALTER TABLE users DROP CONSTRAINT users_role_check;
  END IF;
  
  -- Add new constraint
  ALTER TABLE users ADD CONSTRAINT users_role_check 
    CHECK (role IN ('user', 'admin'));
END $$;

-- Set default role for existing users without role
UPDATE users SET role = 'user' WHERE role IS NULL;

-- Set default role for new users
ALTER TABLE users ALTER COLUMN role SET DEFAULT 'user';