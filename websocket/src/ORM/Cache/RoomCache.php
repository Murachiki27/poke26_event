<?php
declare(strict_types=1);

namespace Poke26\App\ORM\Cache;

use Poke26\App\ORM\State\RoomState;
use Poke26\App\ORM\State\UserState;

final class RoomCache extends BaseCache
{
    public function insert(int $room_id, string $name, string $code, UserState $user_1, ?UserState $user_2 = null): RoomState
    {
        $state = new RoomState($user_1, $user_2);
        $this->cache->set(self::key($room_id), $state);
        return $state;
    }

    public function fetch(int $room_id): ?RoomState
    {
        $cache = $this->cache->get(self::key($room_id));
        if ($cache === null) {
            return null;
        }
        return $cache;
    }

    public function delete(int $room_id): void
    {
        $this->cache->delete(self::key($room_id));
    }

    public function has(int $room_id): bool
    {
        return $this->cache->has(self::key($room_id));
    }

    private static function key(int $room_id): string
    {
        return 'rs_' . $room_id;
    }
}