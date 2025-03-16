/*
  # Update decision text in check constraint

  1. Changes
    - Update the check constraint for the 'decisao' column to use 'Aceitar Jesus' instead of 'Aceitar Jesus Cristo como Salvador'

  2. Security
    - No security changes needed
    - Existing RLS policies remain unchanged
*/

DO $$ 
BEGIN
  -- Drop existing constraint
  ALTER TABLE decisoes DROP CONSTRAINT IF EXISTS valid_decisao;
  
  -- Add updated constraint
  ALTER TABLE decisoes ADD CONSTRAINT valid_decisao CHECK (
    decisao IN (
      'Aceitar Jesus',
      'Reconciliar-me com Cristo',
      'Ser batizado em águas',
      'Quero um Grupo da Cidade'
    )
  );
END $$;