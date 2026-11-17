<?php
require 'api_helpers.php';
require 'conexao.php';
$dados=lerJson();
$id=(int)($dados['id']??0); $nome=trim($dados['nome']??''); $email=trim($dados['email']??''); $telefone=trim($dados['telefone']??'');
if($id<=0||$nome===''||$email==='') responder(['erro'=>'Dados inválidos.'],400);
if(!filter_var($email,FILTER_VALIDATE_EMAIL)) responder(['erro'=>'Digite um e-mail válido.'],400);
try{
  $stmt=$conexao->prepare('UPDATE clientes SET nome=?,email=?,telefone=? WHERE id=?');
  $stmt->bind_param('sssi',$nome,$email,$telefone,$id); $stmt->execute();
  responder(['sucesso'=>true,'mensagem'=>'Cliente atualizado com sucesso!']);
}catch(mysqli_sql_exception $e){
  if($e->getCode()===1062) responder(['erro'=>'Este e-mail já está cadastrado.'],409);
  responder(['erro'=>'Erro ao atualizar cliente.'],500);
}
