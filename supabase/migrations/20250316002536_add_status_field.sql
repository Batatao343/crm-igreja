-- Adiciona o campo status na tabela decisoes
ALTER TABLE decisoes ADD COLUMN status TEXT CHECK (
  status IN (
    'Contato realizado',
    'Em GDC',
    'Curso de batismo',
    'Aguardando contato'
  )
) DEFAULT 'Aguardando contato';

-- Atualiza registros existentes
UPDATE decisoes SET status = 'Aguardando contato' WHERE status IS NULL; 