import { getDatabase } from "@netlify/database";
import { validarSenhaAdmin } from "./admin.mjs";

const db = getDatabase();

export const config = { path: "/api/agendamentos" };

export default async function handler(req) {
  const method = req.method;

  // GET — listar todos
  if (method === "GET") {
    try {
      const rows = await db.sql`SELECT * FROM agendamentos ORDER BY data, horario`;
      return Response.json(rows);
    } catch (err) {
      return Response.json({ error: err.message }, { status: 500 });
    }
  }

  // POST — inserir novo
  if (method === "POST") {
    try {
      const body = await req.json();
      const { responsavel, telefone, aluno, data, turno, turma, horario, observacao } = body;

      if (!/^\d{4}-\d{2}-\d{2}$/.test(String(data || ""))) {
        return Response.json({ error: "Data inválida" }, { status: 400 });
      }

      // Só permite agendamento em datas liberadas pelo administrador
      const dataLiberada = await db.sql`
        SELECT data FROM datas_liberadas WHERE data = ${data} LIMIT 1
      `;
      if (dataLiberada.length === 0) {
        return Response.json({ error: "Data bloqueada para agendamento" }, { status: 403 });
      }

      // Verificar se horário já está ocupado (proteção contra concorrência)
      const existente = await db.sql`
        SELECT id FROM agendamentos
        WHERE data = ${data} AND turno = ${turno} AND turma = ${turma} AND horario = ${horario}
        LIMIT 1
      `;
      if (existente.length > 0) {
        return Response.json({ error: "Horário já ocupado" }, { status: 409 });
      }

      const [novo] = await db.sql`
        INSERT INTO agendamentos (responsavel, telefone, aluno, data, turno, turma, horario, observacao)
        VALUES (${responsavel}, ${telefone}, ${aluno}, ${data}, ${turno}, ${turma}, ${horario}, ${observacao || ""})
        RETURNING *
      `;
      return Response.json(novo, { status: 201 });
    } catch (err) {
      // Se duas pessoas tentarem reservar exatamente o mesmo horário ao mesmo tempo,
      // a restrição UNIQUE do banco garante o bloqueio e retornamos conflito.
      if (err && (err.code === "23505" || String(err.message || "").toLowerCase().includes("unique"))) {
        return Response.json({ error: "Horário já ocupado" }, { status: 409 });
      }
      return Response.json({ error: err.message }, { status: 500 });
    }
  }

  // DELETE — excluir por id ou todos
  if (method === "DELETE") {
    try {
      const url = new URL(req.url);
      const id = url.searchParams.get("id");
      let senhaAdmin = url.searchParams.get("senhaAdmin");
      try {
        const body = await req.json();
        senhaAdmin = body?.senhaAdmin || senhaAdmin;
      } catch (_) {}
      if (!await validarSenhaAdmin(senhaAdmin)) {
        return Response.json({ error: "Senha administrativa inválida" }, { status: 401 });
      }

      if (id === "all") {
        await db.sql`DELETE FROM agendamentos`;
        return Response.json({ ok: true });
      }

      if (id) {
        await db.sql`DELETE FROM agendamentos WHERE id = ${parseInt(id)}`;
        return Response.json({ ok: true });
      }

      return Response.json({ error: "Informe ?id=<numero> ou ?id=all" }, { status: 400 });
    } catch (err) {
      return Response.json({ error: err.message }, { status: 500 });
    }
  }

  return Response.json({ error: "Método não suportado" }, { status: 405 });
}
