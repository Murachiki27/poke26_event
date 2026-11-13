<?php
declare(strict_types=1);

namespace App\Db;

class MySql {
    private static ?Db $poke26 = null;

    public static function poke26(): Db {
        if (!self::$poke26) {
            self::$poke26 = new Db('poke26', 'pikachu', 'pikachu2026');
        }
        return self::$poke26;
    }
}
