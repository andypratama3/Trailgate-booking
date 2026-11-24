<?php

/*
|--------------------------------------------------------------------------
| Bootstrap PHPUnit (hanya testing)
|--------------------------------------------------------------------------
|
| Membuat APP_KEY acak untuk proses tes. Dengan begitu tidak ada kunci yang
| perlu ter-commit (AGENTS.md #11) dan `php artisan test` / `vendor/bin/phpunit`
| bisa dijalankan langsung tanpa langkah setup tambahan.
|
| Dipakai lewat atribut `bootstrap` di phpunit.xml.
|
*/

$testingKey = 'base64:'.base64_encode(random_bytes(32));

putenv("APP_KEY={$testingKey}");
$_ENV['APP_KEY'] = $testingKey;
$_SERVER['APP_KEY'] = $testingKey;

require __DIR__.'/../vendor/autoload.php';
