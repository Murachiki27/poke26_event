<?php
declare(strict_types=1);
require_once __DIR__ . '/../util/db.php';

class UserRepo {

    public static function fetchAll(): array {
        $q = <<<SQL
SELECT name, created_time FROM trx_users
SQL;
        return MySql::poke26()->fetchAll($q);
    }

    public static function fetchFirstById(int $id): array {
        $q = <<<SQL
SELECT * FROM trx_users WHERE id = :id
SQL;
        $res = MySql::poke26()->fetchAll($q, [':id' => $id]);
        return $res[0] ?? [];
    }

    public static function insert(string $name, string $password = ''): void {
        MySql::poke26()->insert("INSERT INTO trx_users SET name = :name, password = :password", [
            ':name' => $name,
            ':password' => $password,
        ]);
    }
}

