-- Adiciona os campos deseja_gdc e observacao na tabela decisoes
ALTER TABLE decisoes 
ADD COLUMN deseja_gdc BOOLEAN DEFAULT false,
ADD COLUMN observacao TEXT,
ADD COLUMN cadastrado_por UUID REFERENCES auth.users;

-- Atualiza registros existentes com o ID do usuário que fez o cadastro
UPDATE decisoes SET cadastrado_por = user_id WHERE cadastrado_por IS NULL; 