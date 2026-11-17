<?php
require 'api_helpers.php'; require 'conexao.php';
$r=$conexao->query('SELECT id,nome,preco,estoque,criado_em FROM produtos ORDER BY id DESC'); responder($r->fetch_all(MYSQLI_ASSOC));
