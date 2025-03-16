-- Adiciona restrição de nome único na tabela decisoes
ALTER TABLE decisoes ADD CONSTRAINT decisoes_nome_key UNIQUE (nome); 