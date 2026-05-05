CREATE TABLE IF NOT EXISTS admin_config (
  chave TEXT PRIMARY KEY,
  valor TEXT NOT NULL,
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO admin_config (chave, valor)
VALUES ('senha_hash', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92')
ON CONFLICT (chave) DO NOTHING;
