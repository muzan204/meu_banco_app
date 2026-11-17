# Meraky Admin — PHP + MySQL

Painel administrativo para gerenciamento de clientes, produtos, estoque e pedidos.

## Funcionalidades
- Dashboard com indicadores operacionais.
- Cadastro, consulta, edição e exclusão de clientes e produtos.
- Pedidos com itens, cálculo de total e movimentação de estoque em transação.
- Exportações CSV no navegador.
- Login de administrador com sessão PHP e proteção CSRF.

## Tecnologias
- PHP 8.2+ com extensões mysqli e mysqlnd
- MySQL ou MariaDB
- HTML, CSS e JavaScript

## Executar localmente com XAMPP
1. Copie o projeto para `C:\xampp\htdocs\meu_banco_app`.
2. Inicie Apache e MySQL.
3. Importe `setup.sql` pelo phpMyAdmin.
4. Configure as variáveis de ambiente abaixo no Apache/PHP.
5. Abra `http://localhost/meu_banco_app/login.html`.

## Variáveis de ambiente obrigatórias
Banco: `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`.

Administrador:
- `ADMIN_USERNAME`: usuário do administrador.
- `ADMIN_PASSWORD_HASH`: hash produzido por `password_hash()`; nunca coloque a senha em texto puro no Git.

Gere um hash com PHP:
```bash
php -r "echo password_hash('SUA_SENHA_FORTE', PASSWORD_DEFAULT), PHP_EOL;"
```
Cadastre o resultado como variável no servidor. Não publique o arquivo `.env` nem compartilhe credenciais.

## Segurança implementada
- Sessão PHP com cookie HttpOnly, SameSite=Strict e Secure quando HTTPS está ativo.
- Expiração por inatividade após 30 minutos e renovação periódica do identificador.
- Autenticação obrigatória em todo endpoint que inclui a conexão com o banco; isso protege listagens, dashboard e operações de escrita.
- Token CSRF obrigatório em requisições mutáveis e verificação de origem.
- Respostas de autenticação e dados sem cache.

## Publicação
Este projeto depende de PHP com sessões e MySQL. Não funciona como site estático puro na Vercel. Use hospedagem compatível com PHP e banco MySQL/MariaDB gerenciado; configure todas as variáveis acima no servidor, HTTPS e restrição de acesso administrativo. Se separar frontend e API em domínios diferentes, será necessário projetar CORS e cookies cross-site explicitamente — não habilite CORS aberto.

Antes de produção, faça testes de integração com banco de staging e HTTPS real, configure limitação de tentativas de login no proxy/WAF, backups automáticos e monitoramento. Use dados fictícios durante os testes.

**Não use dados pessoais ou financeiros reais até concluir os testes e a revisão de segurança do ambiente publicado.**
