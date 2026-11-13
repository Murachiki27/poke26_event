<?php
declare(strict_types=1);

namespace Poke26\Api\ORM\Repository;

use Override;
use Poke26\Api\ORM\Entity\Room;

final class RoomRepository extends Repository
{
    #[Override]
    protected function getEntityClass(): string
    {
        return Room::class;
    }

    #[Override]
    protected function getTableName(): string
    {
        return 'trx_rooms';
    }

    public function fetchFirstByCodeAndJoinable(string $code): ?int
    {
        $rows = $this->db->readQuery("SELECT id FROM trx_rooms WHERE code = :code AND user_id_2 = 0", [':code' => $code]);
        return $rows[0]['id'] ?? null;
    }

    public function updateUserId2(int $id, int $user_id_2): void
    {
        $bind = [
            ':id' => $id,
            ':user_id_2' => $user_id_2,
        ];
        $this->db->writeQuery("UPDATE trx_rooms SET user_id_2 = :user_id_2 WHERE id = :id AND user_id_2 = 0", $bind);
    }
}