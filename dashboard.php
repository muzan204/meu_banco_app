<?php
require 'api_helpers.php';
require 'conexao.php';

function valorEscalar($c, $sql) {
    return $c->query($sql)->fetch_row()[0];
}

$totalClientes = (int)valorEscalar($conexao, 'SELECT COUNT(*) FROM clientes');
$totalProdutos = (int)valorEscalar($conexao, 'SELECT COUNT(*) FROM produtos');
$totalPedidos = (int)valorEscalar($conexao, 'SELECT COUNT(*) FROM pedidos');
$pedidosHoje = (int)valorEscalar($conexao, 'SELECT COUNT(*) FROM pedidos WHERE DATE(criado_em)=CURDATE()');
$estoqueBaixo = (int)valorEscalar($conexao, 'SELECT COUNT(*) FROM produtos WHERE estoque <= 5');
$valorEstoque = (float)valorEscalar($conexao, 'SELECT COALESCE(SUM(preco * estoque),0) FROM produtos');
$faturamento = (float)valorEscalar($conexao, "SELECT COALESCE(SUM(total),0) FROM pedidos WHERE status IN ('Pago','Enviado','Concluído')");
$ticketMedio = (float)valorEscalar($conexao, "SELECT COALESCE(AVG(total),0) FROM pedidos WHERE status IN ('Pago','Enviado','Concluído')");

$ultimos = $conexao->query("SELECT p.id,p.status,p.total,p.criado_em,c.nome cliente_nome FROM pedidos p JOIN clientes c ON c.id=p.cliente_id ORDER BY p.id DESC LIMIT 6")->fetch_all(MYSQLI_ASSOC);

responder(compact(
    'totalClientes',
    'totalProdutos',
    'totalPedidos',
    'pedidosHoje',
    'estoqueBaixo',
    'valorEstoque',
    'faturamento',
    'ticketMedio',
    'ultimos'
));
