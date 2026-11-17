<?php
declare(strict_types=1);

namespace Poke26\App\ORM\Repository;

use Override;
use Poke26\App\ORM\Entity\User;

final class UserSessionRepository extends Repository
{
    #[Override]
    protected function getEntityClass(): string
    {
        return User::class;
    }

    #[Override]
    protected function getTableName(): string
    {
        return 'trx_user_sessions';
    }

    public function fetchFirstById(int $id): ?User
    {
        $row = $this->db->readQuery('SELECT * FROM trx_user_sessions WHERE id = :id', [':id' => $id]);
        return isset($row[0]) ? $this->castEntity($row[0]) : null;
    }
}