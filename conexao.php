<?php
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

$host = getenv('DB_HOST') ?: '127.0.0.1';
$usuario = getenv('DB_USER') ?: 'root';
$senha = getenv('DB_PASSWORD') ?: '';
$banco = getenv('DB_NAME') ?: 'meu_app';
$porta = (int)(getenv('DB_PORT') ?: 3306);

try {
    $conexao = new mysqli($host, $usuario, $senha, $banco, $porta);
    $conexao->set_charset('utf8mb4');
} catch (mysqli_sql_exception $e) {
    error_log('Database connection failed: ' . $e->getMessage());
    header('Content-Type: application/json; charset=UTF-8');
    http_response_code(500);
    echo json_encode(['erro' => 'Serviço temporariamente indisponível.'], JSON_UNESCAPED_UNICODE);
    exit;
}
