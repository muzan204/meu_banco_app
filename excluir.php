<?php
require 'api_helpers.php';
require 'conexao.php';

$id = (int)(lerJson()['id'] ?? 0);
if ($id <= 0) responder(['erro' => 'ID inválido.'], 400);

try {
    $s = $conexao->prepare('DELETE FROM clientes WHERE id=?');
    $s->bind_param('i', $id);
    $s->execute();

    if ($s->affected_rows === 0) responder(['erro' => 'Cliente não encontrado.'], 404);
    responder(['sucesso' => true, 'mensagem' => 'Cliente excluído com sucesso.']);
} catch (mysqli_sql_exception $e) {
    if ((int)$e->getCode() === 1451) {
        responder(['erro' => 'Este cliente possui pedidos. Exclua os pedidos antes de remover o cliente.'], 409);
    }
    responder(['erro' => 'Erro ao excluir cliente.'], 500);
}
