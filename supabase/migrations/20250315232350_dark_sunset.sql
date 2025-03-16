/*
  # Create decisoes table and security policies

  1. New Tables
    - `decisoes`
      - `id` (serial primary key)
      - `nome` (text, required)
      - `decisao` (text, required)
      - `data_decisao` (date)
      - `estado_civil` (text)
      - `nascimento` (date)
      - `email` (text)
      - `cidade` (text)
      - `estado` (text)
      - `bairro` (text)
      - `celular` (text)
      - `celebracao` (text)
      - `celebracao_extra` (text)
      - `user_id` (uuid, references auth.users)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for CRUD operations
    - Only authenticated users can insert
    - Users can only update/delete their own records
    - All authenticated users can read records
*/

-- Create the decisoes table
CREATE TABLE IF NOT EXISTS decisoes (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  decisao TEXT NOT NULL,
  data_decisao DATE DEFAULT CURRENT_DATE,
  estado_civil TEXT CHECK (estado_civil IN ('Solteiro', 'Casado', 'União Estável', 'Divorciado', 'Viúvo')),
  nascimento DATE,
  email TEXT,
  cidade TEXT,
  estado TEXT,
  bairro TEXT,
  celular TEXT,
  celebracao TEXT CHECK (celebracao IN ('Dominical', 'Eleve', 'Ignição', 'Outros')),
  celebracao_extra TEXT,
  user_id UUID REFERENCES auth.users NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT valid_decisao CHECK (
    decisao IN (
      'Aceitar Jesus Cristo como Salvador',
      'Reconciliar-me com Cristo',
      'Ser batizado em águas',
      'Quero um Grupo da Cidade'
    )
  )
);

-- Enable Row Level Security
ALTER TABLE decisoes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for authenticated users"
  ON decisoes
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable insert access for authenticated users"
  ON decisoes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update for users based on user_id"
  ON decisoes
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable delete for users based on user_id"
  ON decisoes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS decisoes_user_id_idx ON decisoes(user_id);
CREATE INDEX IF NOT EXISTS decisoes_data_decisao_idx ON decisoes(data_decisao);
CREATE INDEX IF NOT EXISTS decisoes_created_at_idx ON decisoes(created_at);