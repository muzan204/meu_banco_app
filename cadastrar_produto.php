<?php
require 'api_helpers.php'; require 'conexao.php'; $d=lerJson();
$nome=trim($d['nome']??''); $preco=(float)($d['preco']??-1); $estoque=(int)($d['estoque']??-1);
if($nome===''||$preco<0||$estoque<0) responder(['erro'=>'Preencha nome, preço e estoque corretamente.'],400);
try{$s=$conexao->prepare('INSERT INTO produtos (nome,preco,estoque) VALUES (?,?,?)');$s->bind_param('sdi',$nome,$preco,$estoque);$s->execute();responder(['sucesso'=>true,'mensagem'=>'Produto cadastrado com sucesso!','id'=>$s->insert_id],201);}catch(mysqli_sql_exception $e){responder(['erro'=>'Erro ao cadastrar produto.'],500);}
