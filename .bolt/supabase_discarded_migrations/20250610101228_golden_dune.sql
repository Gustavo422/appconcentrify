/*
  # Create simulados and related tables

  1. New Tables
    - `simulados`
      - `id` (uuid, primary key)
      - `title` (text, not null)
      - `description` (text)
      - `questions_count` (integer, default 0)
      - `duration_minutes` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    - `simulado_questions`
      - `id` (uuid, primary key)
      - `simulado_id` (uuid, foreign key)
      - `question_text` (text, not null)
      - `option_a` (text, not null)
      - `option_b` (text, not null)
      - `option_c` (text, not null)
      - `option_d` (text, not null)
      - `option_e` (text, not null)
      - `correct_answer` (text, not null)
      - `subject` (text)
      - `question_number` (integer)
    - `simulado_responses`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `simulado_id` (uuid, foreign key)
      - `question_id` (uuid, foreign key)
      - `user_answer` (text)
      - `is_correct` (boolean)
      - `response_time` (integer)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to view simulados
    - Add policies for users to manage their own responses
    - Add policies for admins to manage simulados
*/

-- Create simulados table
CREATE TABLE IF NOT EXISTS simulados (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  questions_count integer DEFAULT 0,
  duration_minutes integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create simulado_questions table
CREATE TABLE IF NOT EXISTS simulado_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  simulado_id uuid REFERENCES simulados(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  option_a text NOT NULL,
  option_b text NOT NULL,
  option_c text NOT NULL,
  option_d text NOT NULL,
  option_e text NOT NULL,
  correct_answer text NOT NULL CHECK (correct_answer IN ('A', 'B', 'C', 'D', 'E')),
  subject text,
  question_number integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create simulado_responses table
CREATE TABLE IF NOT EXISTS simulado_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  simulado_id uuid REFERENCES simulados(id) ON DELETE CASCADE,
  question_id uuid REFERENCES simulado_questions(id) ON DELETE CASCADE,
  user_answer text CHECK (user_answer IN ('A', 'B', 'C', 'D', 'E')),
  is_correct boolean NOT NULL,
  response_time integer, -- in seconds
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_simulados_created_at ON simulados(created_at);
CREATE INDEX IF NOT EXISTS idx_simulado_questions_simulado_id ON simulado_questions(simulado_id);
CREATE INDEX IF NOT EXISTS idx_simulado_questions_number ON simulado_questions(question_number);
CREATE INDEX IF NOT EXISTS idx_simulado_responses_user_id ON simulado_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_simulado_responses_simulado_id ON simulado_responses(simulado_id);
CREATE INDEX IF NOT EXISTS idx_simulado_responses_created_at ON simulado_responses(created_at);

-- Enable Row Level Security
ALTER TABLE simulados ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulado_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulado_responses ENABLE ROW LEVEL SECURITY;

-- Policies for simulados table
CREATE POLICY "Users can view simulados" ON simulados
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage simulados" ON simulados
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policies for simulado_questions table
CREATE POLICY "Users can view questions from simulados" ON simulado_questions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage questions" ON simulado_questions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policies for simulado_responses table
CREATE POLICY "Users can view own responses" ON simulado_responses
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own responses" ON simulado_responses
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all responses" ON simulado_responses
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Update triggers for updated_at columns
CREATE TRIGGER update_simulados_updated_at 
  BEFORE UPDATE ON simulados 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_simulado_questions_updated_at 
  BEFORE UPDATE ON simulado_questions 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();