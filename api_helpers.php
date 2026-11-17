<?php
function responder($dados, $status = 200) {
    http_response_code($status);
    header('Content-Type: application/json; charset=UTF-8');
    echo json_encode($dados, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function lerJson() {
    $conteudo = file_get_contents('php://input');
    $dados = json_decode($conteudo ?: '{}', true);
    if (!is_array($dados)) responder(['erro' => 'JSON inválido.'], 400);
    return $dados;
}
