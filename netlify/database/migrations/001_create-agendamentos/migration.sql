CREATE TABLE IF NOT EXISTS agendamentos (
  id          SERIAL PRIMARY KEY,
  criado_em   TIMESTAMPTZ DEFAULT NOW(),
  responsavel TEXT NOT NULL,
  telefone    TEXT NOT NULL,
  aluno       TEXT NOT NULL,
  data        TEXT NOT NULL,
  turno       TEXT NOT NULL,
  turma       TEXT NOT NULL,
  horario     TEXT NOT NULL,
  observacao  TEXT,
  CONSTRAINT agendamento_horario_unico UNIQUE (data, turno, turma, horario)
);
