<?php
declare(strict_types=1);

namespace Poke26\App\ORM\State;

final class RoomState
{
    public function __construct(
        readonly string $name,
        readonly string $code,
        private ?UserState $user_1 = null,
        private ?UserState $user_2 = null,

        private int $ready_count = 0,
        private ?int $ready_timer_id = null,
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

    public function getUserCount(): int
    {
        return count($this->getConnectionIds());
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

    public function deleteUser(int $user_id): int
    {
        if ($this->user_1 !== null && $this->user_1->user_id === $user_id) {
            $this->user_1 = null;
            return 0;
        } elseif ($this->user_2 !== null && $this->user_2->user_id === $user_id) {
            $this->user_2 = null;
            return 1;
        }
        return -1;
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

    public function incrementReadyCount(): void
    {
        $this->ready_count++;
        if ($this->ready_count > 5) {
            $this->ready_count = 5;
        }
    }

    public function resetReadyCount(): void
    {
        $this->ready_count = 0;
    }

    public function getReadyCount(): ?int
    {
        return 5 - $this->ready_count;
    }

    public function isReadyStart(): bool
    {
        return $this->ready_count >= 5;
    }

    public function setReadyTimerId(int $ready_timer_id): void
    {
        $this->ready_timer_id = $ready_timer_id;
    }

    public function clearReadyTimerId(): void
    {
        $this->ready_timer_id = null;
    }

    public function getReadyTimerId(): ?int
    {
        return $this->ready_timer_id;
    }

    public function toArray(): array
    {
        return [
            'name' => $this->name,
            'code' => $this->code,
            'user_1' => $this->user_1?->asArray(),
            'user_2' => $this->user_2?->asArray(),
        ];
    }
}