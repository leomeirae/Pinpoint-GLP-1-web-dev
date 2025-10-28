-- TASK-10: Comparação com Comunidade (Anônima)
-- Execute este SQL no Supabase Dashboard → SQL Editor

-- View de estatísticas da comunidade (ANÔNIMA)
CREATE OR REPLACE VIEW community_stats AS
SELECT
  medications.type as medication_type,
  medications.dosage,
  AVG(weight_lost.total_lost) as avg_weight_lost,
  COUNT(DISTINCT users.id) as user_count,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY weight_lost.total_lost) as median_weight_lost,
  PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY weight_lost.total_lost) as top_25_percentile,
  AVG(weight_lost.weeks_in_treatment) as avg_weeks
FROM users
JOIN medications ON medications.user_id = users.id AND medications.active = true
JOIN LATERAL (
  SELECT
    users.id,
    COALESCE(users.initial_weight, 0) - COALESCE(
      (SELECT weight FROM weight_logs WHERE user_id = users.id ORDER BY date DESC LIMIT 1),
      0
    ) as total_lost,
    GREATEST(1, EXTRACT(EPOCH FROM (NOW() - users.created_at)) / 604800) as weeks_in_treatment
  FROM users
  WHERE users.id = medications.user_id
) weight_lost ON true
WHERE users.initial_weight IS NOT NULL
GROUP BY medications.type, medications.dosage
HAVING COUNT(DISTINCT users.id) >= 5; -- Mínimo 5 usuários para preservar anonimato

-- Permitir leitura para todos (anônimo)
GRANT SELECT ON community_stats TO anon, authenticated;
