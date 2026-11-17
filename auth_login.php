<?php
require 'api_helpers.php';
iniciarSessaoSegura();
exigirOrigemMesmoSite();
if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') responder(['erro' => 'Método não permitido.'], 405);
$dados = lerJson();
$usuario = trim((string)($dados['usuario'] ?? ''));
$senha = (string)($dados['senha'] ?? '');
$usuarioConfig = getenv('ADMIN_USERNAME') ?: '';
$hashConfig = getenv('ADMIN_PASSWORD_HASH') ?: '';
if ($usuarioConfig === '' || $hashConfig === '' || $usuario === '' || $senha === ''
    || !hash_equals($usuarioConfig, $usuario) || !password_verify($senha, $hashConfig)) {
    usleep(350000);
    responder(['erro' => 'Usuário ou senha inválidos. Verifique também a configuração do administrador no servidor.'], 401);
}
session_regenerate_id(true);
$_SESSION['admin_authenticated'] = true;
$_SESSION['admin_username'] = $usuarioConfig;
$_SESSION['csrf_token'] = bin2hex(random_bytes(32));
$_SESSION['last_activity'] = time();
$_SESSION['last_regeneration'] = time();
responder(['sucesso' => true, 'usuario' => $usuarioConfig]);
