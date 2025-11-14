-- Migration: 019_update_mounjaro_to_tirzepatida
-- Created: 2025-11-14
-- Description: Atualizar nome de exibição de "Mounjaro" para "Tirzepatida"

-- Atualizar medication_configs
update medication_configs 
set name = 'Tirzepatida'
where id = 'mounjaro';

-- Comentário para documentação
comment on column medication_configs.name is 'Nome de exibição do medicamento (ex: Tirzepatida, Ozempic)';

