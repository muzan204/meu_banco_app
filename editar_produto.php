<?php
require 'api_helpers.php'; require 'conexao.php'; $d=lerJson();
$id=(int)($d['id']??0);$nome=trim($d['nome']??'');$preco=(float)($d['preco']??-1);$estoque=(int)($d['estoque']??-1);
if($id<=0||$nome===''||$preco<0||$estoque<0) responder(['erro'=>'Dados inválidos.'],400);
try{$s=$conexao->prepare('UPDATE produtos SET nome=?,preco=?,estoque=? WHERE id=?');$s->bind_param('sdii',$nome,$preco,$estoque,$id);$s->execute();responder(['sucesso'=>true,'mensagem'=>'Produto atualizado com sucesso!']);}catch(mysqli_sql_exception $e){responder(['erro'=>'Erro ao atualizar produto.'],500);}
