CREATE TABLE IF NOT EXISTS datas_liberadas (
  data       TEXT PRIMARY KEY,
  criado_em  TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO datas_liberadas (data)
VALUES ('2026-05-20')
ON CONFLICT (data) DO NOTHING;
