<?php
require 'api_helpers.php';
require 'conexao.php';
$dados = lerJson();
$nome = trim($dados['nome'] ?? '');
$email = trim($dados['email'] ?? '');
$telefone = trim($dados['telefone'] ?? '');
if ($nome === '' || $email === '') responder(['erro'=>'Nome e e-mail são obrigatórios.'], 400);
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) responder(['erro'=>'Digite um e-mail válido.'], 400);
try {
    $stmt=$conexao->prepare('INSERT INTO clientes (nome,email,telefone) VALUES (?,?,?)');
    $stmt->bind_param('sss',$nome,$email,$telefone);
    $stmt->execute();
    responder(['sucesso'=>true,'mensagem'=>'Cliente cadastrado com sucesso!','id'=>$stmt->insert_id],201);
} catch (mysqli_sql_exception $e) {
    if ($e->getCode()===1062) responder(['erro'=>'Este e-mail já está cadastrado.'],409);
    responder(['erro'=>'Erro ao cadastrar cliente.'],500);
}
