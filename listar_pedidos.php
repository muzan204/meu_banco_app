<?php
require 'api_helpers.php';
require 'conexao.php';

// Listagens são somente leitura: nunca altere status ou estoque durante um GET.
$sql = "
    SELECT
        p.id, p.status, p.total, p.criado_em,
        c.id AS cliente_id, c.nome AS cliente_nome, c.email AS cliente_email,
        COALESCE(SUM(i.quantidade), 0) AS total_itens
    FROM pedidos p
    JOIN clientes c ON c.id = p.cliente_id
    LEFT JOIN itens_pedido i ON i.pedido_id = p.id
    GROUP BY p.id, p.status, p.total, p.criado_em, c.id, c.nome, c.email
    ORDER BY p.id DESC
";

$resultado = $conexao->query($sql);
$pedidos = $resultado->fetch_all(MYSQLI_ASSOC);

foreach ($pedidos as &$pedido) {
    $stmt = $conexao->prepare("
        SELECT i.produto_id, pr.nome, i.quantidade, i.preco_unitario,
               (i.quantidade * i.preco_unitario) AS subtotal
        FROM itens_pedido i
        JOIN produtos pr ON pr.id = i.produto_id
        WHERE i.pedido_id = ?
    ");
    $stmt->bind_param('i', $pedido['id']);
    $stmt->execute();
    $pedido['itens'] = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    $stmt->close();
}
unset($pedido);

responder($pedidos);
