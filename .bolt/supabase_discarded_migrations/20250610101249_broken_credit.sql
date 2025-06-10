/*
  # Create questoes_semanais table

  1. New Tables
    - `questoes_semanais`
      - `id` (uuid, primary key)
      - `question` (text, not null)
      - `answer` (text, not null)
      - `explanation` (text)
      - `week_number` (integer)
      - `year` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on questoes_semanais table
    - Add policy for authenticated users to read questoes_semanais
    - Add policy for admins to manage questoes_semanais
*/

-- Create questoes_semanais table to match the schema
CREATE TABLE IF NOT EXISTS questoes_semanais (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  explanation text,
  week_number integer,
  year integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_questoes_semanais_week_year ON questoes_semanais(week_number, year);
CREATE INDEX IF NOT EXISTS idx_questoes_semanais_created_at ON questoes_semanais(created_at);

-- Enable Row Level Security
ALTER TABLE questoes_semanais ENABLE ROW LEVEL SECURITY;

-- Policies for questoes_semanais
CREATE POLICY "Users can view questoes semanais" ON questoes_semanais
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage questoes semanais" ON questoes_semanais
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Update trigger
CREATE TRIGGER update_questoes_semanais_updated_at 
  BEFORE UPDATE ON questoes_semanais 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();