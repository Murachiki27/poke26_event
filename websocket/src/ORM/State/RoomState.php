<?php
declare(strict_types=1);

namespace Poke26\App\ORM\State;

final class RoomState
{
        public function __construct(
        private ?UserState $user_1 = null,
        private ?UserState $user_2 = null,
    ) {}

    public function setUser1(UserState $user): void
    {
        $this->user_1 = $user;
    }

    public function getUser1(): ?UserState
    {
        return $this->user_1;
    }

    public function hasUser1(): bool
    {
        return $this->user_1 !== null;
    }

    public function setUser2(UserState $user): void
    {
        $this->user_2 = $user;
    }

    public function getUser2(): ?UserState
    {
        return $this->user_2;
    }

    public function hasUser2(): bool
    {
        return $this->user_2 !== null;
    }

    public function isAllReady(): bool
    {
        if ($this->user_1 !== null && $this->user_2 !== null) {
            return $this->user_1->isReady() && $this->user_2->isReady();
        }
        return false;
    }

    public function findUser(int $user_id): ?UserState
    {
        if ($this->user_1 !== null && $this->user_1->user_id === $user_id) {
            return $this->user_1;
        } elseif ($this->user_2 !== null && $this->user_2->user_id === $user_id) {
            return $this->user_2;
        }
        return null;
    }

    public function deleteUser(int $user_id): ?int
    {
        if ($this->user_1 !== null && $this->user_1->user_id === $user_id) {
            $this->user_1 = null;
            return 0;
        } elseif ($this->user_2 !== null && $this->user_2->user_id === $user_id) {
            $this->user_2 = null;
            return 1;
        }
        return null;
    }

    /**
     * @return int[]
     */
    public function getConnectionIds(): array
    {
        $list = [];
        if ($this->user_1 !== null) {
            $list[] = $this->user_1->connection_id;
        }
        if ($this->user_2 !== null) {
            $list[] = $this->user_2->connection_id;
        }
        return $list;
    }
}