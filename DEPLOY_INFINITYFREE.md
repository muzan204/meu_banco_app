# Publicar no InfinityFree (PHP + MySQL)

Este projeto usa PHP, sessões e MySQL. A hospedagem gratuita InfinityFree oferece PHP, MySQL/MariaDB e SSL, então é uma opção para demonstração e aprendizado. Não use a modalidade gratuita como base para um sistema comercial ou para dados pessoais/financeiros reais: há limites de uso e não há garantias de operação de produção.

## 1. Criar a hospedagem

1. Crie sua conta no site oficial: https://www.infinityfree.com/
2. No painel, crie uma conta de hospedagem e escolha um subdomínio gratuito.
3. No painel da hospedagem, crie um banco MySQL e anote host, nome, usuário e senha do banco.
4. Abra o phpMyAdmin da hospedagem e importe o arquivo `setup.sql` deste repositório. O arquivo SQL não deve ser enviado para a pasta pública do site.

## 2. Preparar a configuração privada

A aplicação lê variáveis de ambiente. Em hospedagem compartilhada sem configuração de variáveis pelo painel, use o arquivo local `config.local.php`:

1. No Gerenciador de Arquivos da hospedagem, abra a pasta `htdocs`.
2. Crie `config.local.php` diretamente nessa pasta.
3. Cole o modelo abaixo e substitua os valores pelos dados exibidos no painel da hospedagem:

```php
<?php
$settings = [
    'DB_HOST' => 'HOST_MYSQL_DO_PAINEL',
    'DB_PORT' => '3306',
    'DB_NAME' => 'NOME_DO_BANCO',
    'DB_USER' => 'USUARIO_DO_BANCO',
    'DB_PASSWORD' => 'SENHA_DO_BANCO',
    'ADMIN_USERNAME' => 'SEU_USUARIO_ADMIN',
    'ADMIN_PASSWORD_HASH' => 'COLE_AQUI_O_HASH',
];

foreach ($settings as $key => $value) {
    putenv($key . '=' . $value);
    $_ENV[$key] = $value;
    $_SERVER[$key] = $value;
}
unset($settings, $key, $value);
```

O arquivo `config.local.php` é carregado automaticamente pelo projeto, não deve ser enviado ao GitHub e é bloqueado para acesso HTTP pelo `.htaccess`.

### Gerar o hash da senha do administrador

No computador com PHP/XAMPP, abra o Shell do XAMPP e execute:

```bash
php -r "echo password_hash('SUA_SENHA_FORTE', PASSWORD_DEFAULT), PHP_EOL;"
```

Copie apenas o hash gerado para `ADMIN_PASSWORD_HASH`. Não coloque a senha em texto puro no código, no GitHub ou nesta conversa. Escolha uma senha única e guarde-a em local seguro.

## 3. Enviar os arquivos do site

1. Abra o Gerenciador de Arquivos no painel da hospedagem.
2. Entre na pasta `htdocs`.
3. Envie os arquivos do projeto que fazem parte do site: arquivos PHP, HTML, CSS, JavaScript e pastas de recursos utilizados pela interface.
4. Envie também o arquivo `.htaccess` para `htdocs`. Ele desativa a listagem de diretórios e bloqueia arquivos sensíveis.
5. Não envie `setup.sql`, `.env.example`, README, arquivos de documentação, a pasta `.github` ou qualquer arquivo que contenha credenciais.
6. Crie `config.local.php` manualmente conforme a seção anterior.

Use o Gerenciador de Arquivos do próprio painel para a publicação. Não coloque credenciais de hospedagem em arquivos do repositório.

## 4. Verificações obrigatórias antes de usar

- Acesse `/login.html` por HTTPS e confirme que o login funciona.
- Confirme que uma sessão expirada redireciona para o login.
- Teste cadastro, edição e exclusão usando apenas dados fictícios.
- Confirme que arquivos `.sql`, `.env` e `config.local.php` não podem ser baixados pelo navegador.
- Verifique que páginas e endpoints administrativos exigem login.
- Faça backup do banco pelo phpMyAdmin antes de alterações importantes.

A hospedagem gratuita pode suspender ou limitar sites que ultrapassem suas regras de uso. A publicação não é considerada concluída até que o banco seja importado, a configuração privada esteja correta e os testes acima passem.
