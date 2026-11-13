<?php
declare(strict_types=1);
require_once __DIR__ . '/../util/db.php';

class RoomRepo {

    public static function fetchAll(): array {
        $q = <<<SQL
SELECT tr.name AS room_name, u.name AS user_name FROM trx_rooms AS tr
  INNER JOIN trx_users AS u ON tr.user_id_1 = u.id
SQL;
        return MySql::poke26()->fetchAll($q);
    }

    public static function fetchFirstByCodeAndJoinable(string $code): array {
        $q = <<<SQL
SELECT * FROM trx_rooms WHERE code = :code AND user_id_2 = 0
SQL;
        return MySql::poke26()->fetchAll($q, [':code' => $code]);
    }

    public static function insertIgnore(string $name, string $code, int $user_id): void {
        $q = <<<SQL
INSERT IGNORE INTO trx_rooms
  SET code = :code, name = :name, user_id_1 = :user_id_1, user_id_2 = :user_id_2, status = :status
SQL;
        MySql::poke26()->insert($q, [
            ':code' => $code,
            ':name' => $name,
            ':user_id_1' => $user_id,
            ':user_id_2' => 0,
            ':status' => 'matching',
        ]);
    }

    public static function updateUser2(string $code, int $user_id): void {
        $q = <<<SQL
UPDATE trx_rooms
  SET user_id_2 = :user_id_2
WHERE code = :code AND user_id_2 = 0
SQL;
        MySql::poke26()->insert($q, [
            ':code' => $code,
            ':user_id_2' => $user_id,
        ]);
    }
}
