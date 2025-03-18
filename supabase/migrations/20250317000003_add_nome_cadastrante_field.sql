-- Adiciona o campo nome_cadastrante
ALTER TABLE decisoes ADD COLUMN nome_cadastrante TEXT NOT NULL DEFAULT '';

-- Atualiza registros existentes com o nome do usuário que os cadastrou
UPDATE decisoes d
SET nome_cadastrante = COALESCE(
  (SELECT email FROM auth.users WHERE id = d.cadastrado_por),
  'Usuário não identificado'
); 