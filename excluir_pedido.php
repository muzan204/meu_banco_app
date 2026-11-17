<?php
require 'api_helpers.php';
require 'conexao.php';

$id = (int)(lerJson()['id'] ?? 0);
if ($id <= 0) responder(['erro' => 'ID inválido.'], 400);

try {
    $conexao->begin_transaction();

    $p = $conexao->prepare('SELECT status FROM pedidos WHERE id=? FOR UPDATE');
    $p->bind_param('i', $id);
    $p->execute();
    $pedido = $p->get_result()->fetch_assoc();

    if (!$pedido) throw new Exception('Pedido não encontrado.');

    // Pedido cancelado já teve o estoque devolvido ao cancelar.
    if ($pedido['status'] !== 'Cancelado') {
        $s = $conexao->prepare('SELECT produto_id,quantidade FROM itens_pedido WHERE pedido_id=?');
        $s->bind_param('i', $id);
        $s->execute();
        $itens = $s->get_result()->fetch_all(MYSQLI_ASSOC);

        foreach ($itens as $i) {
            $u = $conexao->prepare('UPDATE produtos SET estoque=estoque+? WHERE id=?');
            $u->bind_param('ii', $i['quantidade'], $i['produto_id']);
            $u->execute();
        }
    }

    $s = $conexao->prepare('DELETE FROM pedidos WHERE id=?');
    $s->bind_param('i', $id);
    $s->execute();

    $conexao->commit();
    responder(['sucesso'=>true,'mensagem'=>'Pedido excluído com sucesso.']);
} catch (Throwable $e) {
    $conexao->rollback();
    responder(['erro'=>$e instanceof mysqli_sql_exception ? 'Erro ao excluir pedido.' : $e->getMessage()], 400);
}
