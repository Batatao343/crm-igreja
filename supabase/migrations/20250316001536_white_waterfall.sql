/*
  # Update decision types

  1. Changes
    - Update existing decision types to new values
    - Update constraint with new decision options
    
  2. Notes
    - Uses a transaction to ensure data consistency
    - Updates all existing records to match new values
*/

BEGIN;

-- Temporarily disable the constraint
ALTER TABLE decisoes DROP CONSTRAINT IF EXISTS valid_decisao;

-- Update existing records
UPDATE decisoes 
SET decisao = CASE
  WHEN decisao = 'Aceitar Jesus' THEN 'Aceitar Jesus'
  WHEN decisao = 'Reconciliar-me com Cristo' THEN 'Reconciliar com Cristo'
  WHEN decisao = 'Ser batizado em águas' THEN 'Batismo'
  WHEN decisao = 'Quero um Grupo da Cidade' THEN 'Quero GDC'
  ELSE decisao
END;

-- Add the constraint back with new values
ALTER TABLE decisoes ADD CONSTRAINT valid_decisao CHECK (
  decisao IN (
    'Aceitar Jesus',
    'Reconciliar com Cristo',
    'Batismo',
    'Quero GDC'
  )
);

COMMIT;