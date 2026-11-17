<?php
require 'api_helpers.php';
iniciarSessaoSegura();
if (empty($_SESSION['admin_authenticated'])) responder(['autenticado' => false], 401);
if (empty($_SESSION['csrf_token'])) $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
responder(['autenticado' => true, 'usuario' => $_SESSION['admin_username'] ?? 'Administrador', 'csrfToken' => $_SESSION['csrf_token']]);
