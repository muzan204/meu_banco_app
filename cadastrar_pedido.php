<?php
require 'api_helpers.php';
require 'conexao.php';

$d = lerJson();
$clienteId = (int)($d['cliente_id'] ?? 0);
$itensRecebidos = $d['itens'] ?? [];

if ($clienteId <= 0 || !is_array($itensRecebidos) || count($itensRecebidos) === 0) {
    responder(['erro' => 'Escolha um cliente e ao menos um produto.'], 400);
}

// Junta produtos repetidos antes de validar o estoque.
$agrupados = [];
foreach ($itensRecebidos as $item) {
    $pid = (int)($item['produto_id'] ?? 0);
    $qtd = (int)($item['quantidade'] ?? 0);
    if ($pid <= 0 || $qtd <= 0) responder(['erro' => 'Há um item inválido no pedido.'], 400);
    $agrupados[$pid] = ($agrupados[$pid] ?? 0) + $qtd;
}

try {
    $conexao->begin_transaction();

    $c = $conexao->prepare('SELECT id FROM clientes WHERE id=?');
    $c->bind_param('i', $clienteId);
    $c->execute();
    if (!$c->get_result()->fetch_assoc()) throw new Exception('Cliente não encontrado.');

    $total = 0;
    $validados = [];

    foreach ($agrupados as $pid => $qtd) {
        $s = $conexao->prepare('SELECT id,nome,preco,estoque FROM produtos WHERE id=? FOR UPDATE');
        $s->bind_param('i', $pid);
        $s->execute();
        $produto = $s->get_result()->fetch_assoc();

        if (!$produto) throw new Exception('Produto não encontrado.');
        if ((int)$produto['estoque'] < $qtd) {
            throw new Exception('Estoque insuficiente para ' . $produto['nome'] . '. Disponível: ' . $produto['estoque'] . '.');
        }

        $preco = (float)$produto['preco'];
        $total += $preco * $qtd;
        $validados[] = [(int)$pid, $qtd, $preco];
    }

    $status = 'Pendente';
    $s = $conexao->prepare('INSERT INTO pedidos (cliente_id,status,total) VALUES (?,?,?)');
    $s->bind_param('isd', $clienteId, $status, $total);
    $s->execute();
    $pedidoId = $s->insert_id;

    foreach ($validados as [$pid, $qtd, $preco]) {
        $s = $conexao->prepare('INSERT INTO itens_pedido (pedido_id,produto_id,quantidade,preco_unitario) VALUES (?,?,?,?)');
        $s->bind_param('iiid', $pedidoId, $pid, $qtd, $preco);
        $s->execute();

        $s = $conexao->prepare('UPDATE produtos SET estoque=estoque-? WHERE id=?');
        $s->bind_param('ii', $qtd, $pid);
        $s->execute();
    }

    $conexao->commit();
    responder(['sucesso'=>true,'mensagem'=>'Pedido criado com sucesso!','id'=>$pedidoId,'total'=>$total], 201);
} catch (Throwable $e) {
    $conexao->rollback();
    responder(['erro'=>$e instanceof mysqli_sql_exception ? 'Erro ao criar pedido.' : $e->getMessage()], 400);
}
