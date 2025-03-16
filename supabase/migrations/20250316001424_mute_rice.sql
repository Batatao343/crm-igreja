/*
  # Update decision text and constraints

  1. Changes
    - Temporarily disable the constraint
    - Update existing records to use new decision text
    - Re-enable constraint with new values
    
  2. Notes
    - Uses a transaction to ensure data consistency
    - Safely updates existing data without constraint violations
*/

BEGIN;

-- Temporarily disable the constraint
ALTER TABLE decisoes DROP CONSTRAINT IF EXISTS valid_decisao;

-- Update existing records
UPDATE decisoes 
SET decisao = 'Aceitar Jesus'
WHERE decisao = 'Aceitar Jesus Cristo como Salvador';

-- Add the constraint back with new values
ALTER TABLE decisoes ADD CONSTRAINT valid_decisao CHECK (
  decisao IN (
    'Aceitar Jesus',
    'Reconciliar-me com Cristo',
    'Ser batizado em águas',
    'Quero um Grupo da Cidade'
  )
);

COMMIT;