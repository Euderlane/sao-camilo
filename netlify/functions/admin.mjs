import { getDatabase } from "@netlify/database";

const db = getDatabase();

export const config = { path: "/api/admin" };

async function sha256(texto) {
  const data = new TextEncoder().encode(String(texto || ""));
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, "0")).join("");
}

async function obterHashAtual() {
  const rows = await db.sql`SELECT valor FROM admin_config WHERE chave = 'senha_hash' LIMIT 1`;
  if (rows.length > 0) return rows[0].valor;
  const hashPadrao = await sha256("123456");
  await db.sql`
    INSERT INTO admin_config (chave, valor)
    VALUES ('senha_hash', ${hashPadrao})
    ON CONFLICT (chave) DO NOTHING
  `;
  return hashPadrao;
}

async function senhaConfere(senha) {
  const hashAtual = await obterHashAtual();
  const hashInformado = await sha256(senha);
  return hashAtual === hashInformado;
}

export async function validarSenhaAdmin(senha) {
  return senhaConfere(senha);
}

export default async function handler(req) {
  if (req.method !== "POST") {
    return Response.json({ error: "Método não suportado" }, { status: 405 });
  }

  try {
    const body = await req.json();
    const { acao, senha, senhaAtual, novaSenha } = body;

    if (acao === "login") {
      const ok = await senhaConfere(senha);
      return Response.json({ ok }, { status: ok ? 200 : 401 });
    }

    if (acao === "alterar-senha") {
      if (!await senhaConfere(senhaAtual)) {
        return Response.json({ error: "Senha atual incorreta" }, { status: 401 });
      }
      if (typeof novaSenha !== "string" || novaSenha.length < 6) {
        return Response.json({ error: "A nova senha deve ter pelo menos 6 caracteres" }, { status: 400 });
      }
      const novoHash = await sha256(novaSenha);
      await db.sql`
        INSERT INTO admin_config (chave, valor, atualizado_em)
        VALUES ('senha_hash', ${novoHash}, NOW())
        ON CONFLICT (chave) DO UPDATE SET valor = EXCLUDED.valor, atualizado_em = NOW()
      `;
      return Response.json({ ok: true });
    }

    return Response.json({ error: "Ação inválida" }, { status: 400 });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
