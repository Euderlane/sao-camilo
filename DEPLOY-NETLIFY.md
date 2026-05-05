# Deploy do site Sao Camilo no Netlify com banco de dados

Este pacote ja esta pronto para deploy no Netlify usando Netlify Database/Postgres.

## 1. Subir para o GitHub

Crie um repositorio e envie todos os arquivos desta pasta.

Comandos sugeridos:

```bash
git init
git add .
git commit -m "Deploy inicial site Sao Camilo"
git branch -M main
git remote add origin URL_DO_REPOSITORIO
git push -u origin main
```

## 2. Criar o site no Netlify

1. Acesse o Netlify.
2. Clique em **Add new site** > **Import an existing project**.
3. Escolha o repositorio do GitHub.
4. Use estas configuracoes:
   - Build command: deixe vazio
   - Publish directory: `.`
   - Functions directory: `netlify/functions` (padrao)

O arquivo `netlify.toml` ja informa o diretorio publico.

## 3. Banco de dados

O projeto possui a dependencia `@netlify/database`. Ao fazer deploy, o Netlify detecta essa dependencia e provisiona o Netlify Database/Postgres.

As migrations ficam em:

```text
netlify/database/migrations/
```

Elas criam automaticamente:

- `agendamentos`
- `datas_liberadas`
- `admin_config`

Senha administrativa inicial:

```text
123456
```

Troque a senha pela area administrativa assim que o site estiver online.

## 4. Testes depois do deploy

Acesse estes endpoints no dominio publicado:

```text
/api/datas-liberadas
/api/agendamentos
/api/admin
```

Observacao: `/api/admin` aceita apenas POST, entao abrir no navegador pode retornar metodo nao suportado. Isso e esperado.

## 5. Se o site abrir mas nao salvar

Verifique no Netlify:

1. Se o deploy terminou sem erro.
2. Se as Functions foram publicadas.
3. Se o Netlify Database foi criado.
4. Se as migrations foram aplicadas.

