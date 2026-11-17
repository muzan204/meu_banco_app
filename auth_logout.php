<?php
require 'api_helpers.php';
exigirAdministrador();
$_SESSION = [];
if (ini_get('session.use_cookies')) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', [
        'expires' => time() - 42000, 'path' => $params['path'],
        'domain' => $params['domain'], 'secure' => $params['secure'],
        'httponly' => $params['httponly'], 'samesite' => 'Strict',
    ]);
}
session_destroy();
responder(['sucesso' => true]);
