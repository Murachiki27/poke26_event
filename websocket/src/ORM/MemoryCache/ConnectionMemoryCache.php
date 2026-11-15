<?php
declare(strict_types=1);

namespace Poke26\App\ORM\MemoryCache;

use Poke26\App\ORM\State\ConnectionState;
use Workerman\Connection\TcpConnection;

final class ConnectionMemoryCache extends BaseCache
{
    public function insert(TcpConnection $connection, int $room_id, int $user_id): void
    {
        $this->cache->set(self::key($connection->id), new ConnectionState($connection, $room_id, $user_id));
    }

    public function fetch(int $connection_id): ?ConnectionState
    {
        $cache = $this->cache->get(self::key($connection_id));
        if ($cache === null) {
            return null;
        }
        return $cache;
    }

    public function delete(int $connection_id): void
    {
        $this->cache->delete(self::key($connection_id));
    }

    public function has(int $connection_id): bool
    {
        return $this->cache->has(self::key($connection_id));
    }

    private static function key(int $connection_id): string
    {
        return 'cs_' . $connection_id;
    }
}