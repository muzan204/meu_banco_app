<?php
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

$host = 'localhost';
$usuario = 'root';
$senha = '';
$banco = 'meu_app';

try {
    $conexao = new mysqli($host, $usuario, $senha, $banco);
    $conexao->set_charset('utf8mb4');
} catch (mysqli_sql_exception $e) {
    header('Content-Type: application/json; charset=UTF-8');
    http_response_code(500);
    echo json_encode(['erro' => 'Não foi possível conectar ao banco de dados. Verifique MySQL/XAMPP.'], JSON_UNESCAPED_UNICODE);
    exit;
}
