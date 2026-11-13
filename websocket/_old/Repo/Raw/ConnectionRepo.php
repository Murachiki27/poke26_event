<?php
declare(strict_types=1);

namespace App\Repo\Raw;

use Workerman\Connection\TcpConnection;

class ConnectionRepo {
    /**
     * @var TcpConnection[]
     */
    private static array $cache = [];
    
    public static function insert(TcpConnection $connection): void
    {
        $id = $connection->id;
        self::$cache[$id] = ['conn' => $connection, 'user_id' => null];
    }

    public static function updateUserId(TcpConnection $connection, int $user_id): void
    {
        $id = $connection->id;
        self::$cache[$id]['user_id'] = $user_id;
    }

    public static function delete(TcpConnection $connection): void
    {
        $id = $connection->id;
        unset(self::$cache[$id]);
    }
}
