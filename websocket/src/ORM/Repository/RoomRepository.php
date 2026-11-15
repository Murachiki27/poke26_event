<?php
declare(strict_types=1);

namespace Poke26\App\ORM\Repository;

use Override;
use Poke26\App\ORM\Entity\Room;

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

    public function fetchFirstByIdAndUserId(int $id, int $user_id): ?Room
    {
        $rows = $this->db->readQuery("SELECT * FROM trx_rooms WHERE id = :id AND (user_id_1 = :user_id OR user_id_2 = :user_id)", [':id' => $id, ':user_id'=> $user_id]);
        return $this->castEntities($rows)[0] ?? null;
    }

    public function fetchFirstByCodeAndJoinable(string $code): ?int
    {
        $rows = $this->db->readQuery("SELECT id FROM trx_rooms WHERE code = :code AND user_id_2 IS NULL", [':code' => $code]);
        return $rows[0]['id'] ?? null;
    }

    public function updateUserId2(int $id, ?int $old_user_id, ?int $new_user_id): void
    {
        $q_c = $old_user_id == null ? 'user_id_2 IS NULL' : 'user_id_2 = :old_user_id_2';
        $bind = [
            ':id' => $id,
            ':old_user_id_2' => $old_user_id,
            ':new_user_id_2' => $new_user_id,
        ];
        $this->db->writeQuery("UPDATE trx_rooms SET user_id_2 = :new_user_id_2 WHERE id = :id AND $q_c", $bind);
    }

    public function delete(int $id): void
    {
        $this->db->writeQuery("DELETE FROM trx_rooms WHERE id = :id", [':id' => $id]);
    }
}