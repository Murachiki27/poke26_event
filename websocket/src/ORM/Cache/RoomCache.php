<?php
declare(strict_types=1);

namespace Poke26\App\ORM\Cache;

use Poke26\App\ORM\State\RoomState;
use Poke26\App\ORM\State\UserState;

/**
 * @extends parent<string, RoomState>
 */
final class RoomCache extends BaseCache
{
    public function insert(string $room_code, string $name, UserState $user_1, ?UserState $user_2 = null): RoomState
    {
        $state = new RoomState($name, $room_code, $user_1, $user_2);
        $this->cache->set(self::key($room_code), $state);
        return $state;
    }

    public function fetch(string $room_code): ?RoomState
    {
        $cache = $this->cache->get(self::key($room_code));
        if ($cache === null) {
            return null;
        }
        return $cache;
    }

    public function delete(string $room_code): void
    {
        $this->cache->delete(self::key($room_code));
    }

    public function has(string $room_code): bool
    {
        return $this->cache->has(self::key($room_code));
    }

    private static function key(string $room_code): string
    {
        return 'rs_' . $room_code;
    }

    protected function type(): string
    {
        return 'rs_';
    }
}