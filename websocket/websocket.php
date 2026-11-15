<?php
declare(strict_types=1);

require_once __DIR__ . '/config.php';

use Poke26\App\App;
use Poke26\App\Lib\Db\Db;

$db = new Db(DB_DSN_POKE26, DB_USERNAME, DB_PASSWORD);

new App($db)->run();