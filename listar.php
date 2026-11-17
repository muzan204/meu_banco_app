<?php
require 'api_helpers.php';
require 'conexao.php';
$resultado=$conexao->query('SELECT id,nome,email,telefone,criado_em FROM clientes ORDER BY id DESC');
responder($resultado->fetch_all(MYSQLI_ASSOC));
