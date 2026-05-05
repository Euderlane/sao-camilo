# Sistema de Agendamento - Escola São Camilo

## O que esta versão possui

- Agendamento dos pais com bloqueio automático de horário ocupado.
- Controle de datas no modo administrador: somente as datas liberadas aparecem para os pais.
- Bloqueio de datas sem apagar agendamentos já realizados.
- Exportação dos agendamentos em CSV/Excel.
- Senha de administrador salva no banco de dados.
- Opção no painel administrativo para alterar a senha.

## Senha inicial do administrador

A senha inicial é:

```text
123456
```

Após entrar no painel administrativo, vá em **Alterar senha do administrador**, digite a nova senha e confirme.

## Importante sobre o banco de dados

Este projeto foi preparado para Netlify com Netlify Database/Postgres. Para funcionar corretamente, o banco precisa estar criado/ativo no Netlify e as migrations precisam rodar no deploy.

As migrations criam:

1. `agendamentos`
2. `datas_liberadas`
3. `admin_config`, onde fica salva a senha do administrador em formato de hash.

## Deploy no Netlify

1. Envie a pasta para um repositório no GitHub.
2. No Netlify, crie um novo site importando esse repositório.
3. Configure o diretório de publicação como `.`.
4. Ative/provisione o Netlify Database.
5. Faça um novo deploy.

## Observação

Se as datas não aparecerem para os pais, entre no admin e libere pelo menos uma data.
