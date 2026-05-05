import { getDatabase } from "@netlify/database";
import { validarSenhaAdmin } from "./admin.mjs";

const db = getDatabase();

export const config = { path: "/api/datas-liberadas" };

function dataValida(data) {
  return typeof data === "string" && /^\d{4}-\d{2}-\d{2}$/.test(data);
}

export default async function handler(req) {
  const method = req.method;

  if (method === "GET") {
    try {
      const rows = await db.sql`SELECT data, criado_em FROM datas_liberadas ORDER BY data`;
      return Response.json(rows);
    } catch (err) {
      return Response.json({ error: err.message }, { status: 500 });
    }
  }

  if (method === "POST") {
    try {
      const body = await req.json();
      const { data, senhaAdmin } = body;
      if (!await validarSenhaAdmin(senhaAdmin)) {
        return Response.json({ error: "Senha administrativa inválida" }, { status: 401 });
      }
      if (!dataValida(data)) {
        return Response.json({ error: "Data inválida" }, { status: 400 });
      }
      const [row] = await db.sql`
        INSERT INTO datas_liberadas (data)
        VALUES (${data})
        ON CONFLICT (data) DO UPDATE SET data = EXCLUDED.data
        RETURNING data, criado_em
      `;
      return Response.json(row, { status: 201 });
    } catch (err) {
      return Response.json({ error: err.message }, { status: 500 });
    }
  }

  if (method === "DELETE") {
    try {
      const url = new URL(req.url);
      const data = url.searchParams.get("data");
      let senhaAdmin = url.searchParams.get("senhaAdmin");
      try {
        const body = await req.json();
        senhaAdmin = body?.senhaAdmin || senhaAdmin;
      } catch (_) {}
      if (!await validarSenhaAdmin(senhaAdmin)) {
        return Response.json({ error: "Senha administrativa inválida" }, { status: 401 });
      }
      if (!dataValida(data)) {
        return Response.json({ error: "Informe ?data=AAAA-MM-DD" }, { status: 400 });
      }
      await db.sql`DELETE FROM datas_liberadas WHERE data = ${data}`;
      return Response.json({ ok: true });
    } catch (err) {
      return Response.json({ error: err.message }, { status: 500 });
    }
  }

  return Response.json({ error: "Método não suportado" }, { status: 405 });
}
