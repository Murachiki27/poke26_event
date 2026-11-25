<?php
declare(strict_types=1);

namespace Poke26\App\Lib\Db;

class DbFactory
{
    public static function create(): Db
    {
        return new Db(DB_DSN_POKE26, DB_USERNAME, DB_PASSWORD);
    }
}