<?php
require 'api_helpers.php';
require 'conexao.php';

$d = lerJson();
$id = (int)($d['id'] ?? 0);
$novoStatus = $d['status'] ?? '';
$permitidos = ['Pendente','Pago','Enviado','Concluído','Cancelado'];

if ($id <= 0 || !in_array($novoStatus, $permitidos, true)) {
    responder(['erro' => 'Dados inválidos.'], 400);
}

try {
    $conexao->begin_transaction();

    $s = $conexao->prepare('SELECT status FROM pedidos WHERE id=? FOR UPDATE');
    $s->bind_param('i', $id);
    $s->execute();
    $pedido = $s->get_result()->fetch_assoc();

    if (!$pedido) {
        throw new Exception('Pedido não encontrado.');
    }

    $statusAtual = $pedido['status'];

    if ($statusAtual === $novoStatus) {
        $conexao->commit();
        responder(['sucesso' => true, 'mensagem' => 'Status mantido.']);
    }

    $itensStmt = $conexao->prepare('SELECT produto_id, quantidade FROM itens_pedido WHERE pedido_id=?');
    $itensStmt->bind_param('i', $id);
    $itensStmt->execute();
    $itens = $itensStmt->get_result()->fetch_all(MYSQLI_ASSOC);

    // Ao cancelar, devolvemos o estoque reservado pelo pedido.
    if ($novoStatus === 'Cancelado' && $statusAtual !== 'Cancelado') {
        foreach ($itens as $item) {
            $u = $conexao->prepare('UPDATE produtos SET estoque = estoque + ? WHERE id = ?');
            $u->bind_param('ii', $item['quantidade'], $item['produto_id']);
            $u->execute();
        }
    }

    // Se reativar um pedido cancelado, o estoque precisa existir novamente.
    if ($statusAtual === 'Cancelado' && $novoStatus !== 'Cancelado') {
        foreach ($itens as $item) {
            $p = $conexao->prepare('SELECT nome, estoque FROM produtos WHERE id=? FOR UPDATE');
            $p->bind_param('i', $item['produto_id']);
            $p->execute();
            $produto = $p->get_result()->fetch_assoc();

            if (!$produto || (int)$produto['estoque'] < (int)$item['quantidade']) {
                $nome = $produto['nome'] ?? 'produto removido';
                throw new Exception('Estoque insuficiente para reativar o pedido: ' . $nome . '.');
            }
        }

        foreach ($itens as $item) {
            $u = $conexao->prepare('UPDATE produtos SET estoque = estoque - ? WHERE id = ?');
            $u->bind_param('ii', $item['quantidade'], $item['produto_id']);
            $u->execute();
        }
    }

    $u = $conexao->prepare('UPDATE pedidos SET status=? WHERE id=?');
    $u->bind_param('si', $novoStatus, $id);
    $u->execute();

    $conexao->commit();
    responder(['sucesso' => true, 'mensagem' => 'Status atualizado com sucesso.']);
} catch (Throwable $e) {
    $conexao->rollback();
    responder(['erro' => $e instanceof mysqli_sql_exception ? 'Erro ao atualizar status.' : $e->getMessage()], 400);
}
