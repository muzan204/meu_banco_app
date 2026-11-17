# Meraky Admin — PHP + MySQL

Painel administrativo para gerenciamento de clientes, produtos, estoque e pedidos.

## Funcionalidades
- Dashboard com indicadores operacionais.
- Cadastro, consulta, edição e exclusão de clientes e produtos.
- Pedidos com itens, cálculo de total e movimentação de estoque em transação.
- Cancelamento e reativação de pedidos.
- Exportações CSV no navegador.

## Tecnologias
- PHP com extensão mysqli
- MySQL ou MariaDB
- HTML, CSS e JavaScript

## Executar localmente com XAMPP
1. Copie o projeto para `C:\\xampp\\htdocs\\meu_banco_app`.
2. Inicie Apache e MySQL.
3. Importe `setup.sql` pelo phpMyAdmin.
4. Configure as variáveis de ambiente do banco (ou use os padrões locais de XAMPP em `conexao.php`).
5. Abra `http://localhost/meu_banco_app/`.

## Configuração do banco
A aplicação lê `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER` e `DB_PASSWORD`.
Use `.env.example` apenas como modelo. Não envie credenciais reais ao GitHub.

## Publicação
Este repositório contém endpoints PHP e depende de MySQL. O deploy está **bloqueado até** existir:
- Hospedagem que execute PHP de forma compatível com a aplicação.
- Banco MySQL/MariaDB gerenciado e acessível pelo backend.
- Autenticação/autorização de administrador em todos os endpoints de escrita.
- Proteção CSRF, política CORS restritiva (se frontend/backend forem separados), HTTPS e configuração de segredos.
- Testes de integração com banco de staging.

A Vercel pode hospedar a camada web estática, mas não executa este projeto PHP/MySQL como um site estático. Não configure um deploy público dos endpoints antes de implementar a autenticação. Uma arquitetura possível é frontend na Vercel e API PHP + MySQL em um serviço compatível.

## Status de segurança
Este projeto ainda está em desenvolvimento. Os endpoints atuais de escrita não possuem autenticação; portanto, **não use com dados reais nem exponha a API publicamente**.
