<?php
declare(strict_types=1);

namespace Poke26\App\ORM\MemoryCache;

use Poke26\App\Lib\MemoryCache;
use Poke26\App\ORM\State\UserState;
use Workerman\Connection\TcpConnection;

final class UserStateMemoryCache
{
    private MemoryCache $cache;

    public function __construct(MemoryCache $cache)
    {
        $this->cache = $cache;
    }

    public function insert(TcpConnection $connection): void
    {
        $this->cache->set(self::key($connection->id), new UserState(connection: $connection, user_id: null));
    }

    public function fetch(int $connection_id): ?UserState
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

    public function fetchKeys(): array
    {
        return $this->cache->keys();
    }

    private static function key(int $connection_id): string
    {
        return 'us_' . $connection_id;
    }
}