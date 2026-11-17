# Meraky Admin — XAMPP + PHP + MySQL

Painel administrativo local com banco relacional real.

## Módulos
- Dashboard com clientes, produtos, pedidos, faturamento, ticket médio e valor em estoque.
- Clientes: cadastrar, pesquisar, editar, excluir e exportar CSV.
- Produtos: cadastrar, pesquisar, editar, excluir, acompanhar estoque e exportar CSV.
- Pedidos: relaciona cliente + produtos, calcula total, controla estoque, altera status e exporta CSV.

## Banco relacional
- `clientes` 1:N `pedidos`
- `pedidos` 1:N `itens_pedido`
- `produtos` 1:N `itens_pedido`

## Instalação
1. Copie a pasta `meu_banco_app` para `C:\xampp\htdocs\`.
2. Ligue Apache e MySQL no XAMPP.
3. Abra `http://localhost/phpmyadmin`.
4. Importe `setup.sql`.
5. Abra `http://localhost/meu_banco_app/`.

## Melhorias desta versão
- Cancelar pedido devolve o estoque automaticamente.
- Reativar pedido cancelado confere e retira o estoque novamente.
- Excluir pedido cancelado não devolve estoque em duplicidade.
- Itens repetidos em um pedido são agrupados no backend antes da validação.
- Mensagens melhores quando cliente/produto já está ligado a pedidos.
- Exportação CSV para clientes, produtos e pedidos.
- Dashboard mais completo e layout mais polido/responsivo.
