<?php
declare(strict_types=1);

namespace Poke26\App\ORM\Repository;

use Override;
use Poke26\Api\ORM\Entity\User;

final class UserRepository extends Repository
{
    #[Override]
    protected function getEntityClass(): string
    {
        return User::class;
    }

    #[Override]
    protected function getTableName(): string
    {
        return 'trx_users';
    }

    public static function fetchFirstById(int $id): array {
        $q = <<<SQL
SELECT * FROM trx_users WHERE id = :id
SQL;
        $res = MySql::poke26()->fetchAll($q, [':id' => $id]);
        return $res[0] ?? [];
    }

    // public static function insert(string $name, string $password = ''): void {
    //     MySql::poke26()->insert("INSERT INTO trx_users SET name = :name, password = :password", [
    //         ':name' => $name,
    //         ':password' => $password,
    //     ]);
    // }
}