<?php
// Configuração local opcional para hospedagens compartilhadas.
// O arquivo config.local.php não é versionado e deve permanecer bloqueado pelo .htaccess.
$configLocal = __DIR__ . '/config.local.php';
if (is_file($configLocal)) {
    require_once $configLocal;
}
unset($configLocal);

function responder($dados, $status = 200) {
    http_response_code($status);
    header('Content-Type: application/json; charset=UTF-8');
    header('Cache-Control: no-store, private');
    echo json_encode($dados, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}
function lerJson() {
    $conteudo = file_get_contents('php://input');
    $dados = json_decode($conteudo ?: '{}', true);
    if (!is_array($dados)) responder(['erro' => 'JSON inválido.'], 400);
    return $dados;
}
function iniciarSessaoSegura() {
    if (session_status() === PHP_SESSION_ACTIVE) return;
    $https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https');
    session_name('MERAKY_ADMIN_SESSION');
    session_set_cookie_params([
        'lifetime' => 0, 'path' => '/', 'secure' => $https,
        'httponly' => true, 'samesite' => 'Strict',
    ]);
    ini_set('session.use_strict_mode', '1');
    ini_set('session.use_only_cookies', '1');
    session_start();
    $agora = time();
    if (isset($_SESSION['last_activity']) && ($agora - (int)$_SESSION['last_activity']) > 1800) {
        $_SESSION = [];
        session_regenerate_id(true);
    }
    $_SESSION['last_activity'] = $agora;
}
function exigirOrigemMesmoSite() {
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    $fetchSite = strtolower($_SERVER['HTTP_SEC_FETCH_SITE'] ?? '');
    if ($origin === '') {
        if ($fetchSite !== 'same-origin') {
            responder(['erro' => 'Origem da requisição não confirmada.'], 403);
        }
        return;
    }

    $https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https');
    $schemeEsperado = $https ? 'https' : 'http';
    $hostCabecalho = $_SERVER['HTTP_HOST'] ?? '';
    $hostEsperado = parse_url('http://' . $hostCabecalho, PHP_URL_HOST);
    $portaEsperada = parse_url('http://' . $hostCabecalho, PHP_URL_PORT);
    $partesOrigin = parse_url($origin);

    if (!is_array($partesOrigin)
        || !isset($partesOrigin['scheme'], $partesOrigin['host'])
        || isset($partesOrigin['user']) || isset($partesOrigin['pass'])
        || isset($partesOrigin['path']) && $partesOrigin['path'] !== ''
        || isset($partesOrigin['query']) || isset($partesOrigin['fragment'])) {
        responder(['erro' => 'Origem da requisição não permitida.'], 403);
    }

    $portaOrigin = $partesOrigin['port'] ?? (strtolower($partesOrigin['scheme']) === 'https' ? 443 : 80);
    $portaRequest = $portaEsperada ?? ($https ? 443 : 80);
    if (strtolower($partesOrigin['scheme']) !== $schemeEsperado
        || strtolower($partesOrigin['host']) !== strtolower((string)$hostEsperado)
        || $portaOrigin !== $portaRequest
        || $fetchSite === 'cross-site') {
        responder(['erro' => 'Origem da requisição não permitida.'], 403);
    }
}
function exigirAdministrador() {
    iniciarSessaoSegura();
    if (empty($_SESSION['admin_authenticated'])) {
        responder(['erro' => 'Autenticação necessária.'], 401);
    }
    $metodo = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
    if (!in_array($metodo, ['GET', 'HEAD', 'OPTIONS'], true)) {
        exigirOrigemMesmoSite();
        $csrf = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
        if (empty($_SESSION['csrf_token']) || !is_string($csrf)
            || !hash_equals($_SESSION['csrf_token'], $csrf)) {
            responder(['erro' => 'Token de segurança inválido. Atualize a página e tente novamente.'], 403);
        }
    }
    if (time() - (int)($_SESSION['last_regeneration'] ?? 0) > 900) {
        session_regenerate_id(true);
        $_SESSION['last_regeneration'] = time();
    }
}
