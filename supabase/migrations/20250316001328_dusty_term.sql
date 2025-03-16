/*
  # Update decision text and constraints

  1. Changes
    - Update existing records to use new decision text
    - Update check constraint for the 'decisao' column
    
  2. Notes
    - First updates existing data to prevent constraint violations
    - Then updates the constraint to enforce new values
*/

DO $$ 
BEGIN
  -- First update existing records
  UPDATE decisoes 
  SET decisao = 'Aceitar Jesus'
  WHERE decisao = 'Aceitar Jesus Cristo como Salvador';

  -- Then update the constraint
  ALTER TABLE decisoes DROP CONSTRAINT IF EXISTS valid_decisao;
  
  ALTER TABLE decisoes ADD CONSTRAINT valid_decisao CHECK (
    decisao IN (
      'Aceitar Jesus',
      'Reconciliar-me com Cristo',
      'Ser batizado em águas',
      'Quero um Grupo da Cidade'
    )
  );
END $$;