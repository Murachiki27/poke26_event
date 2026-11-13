<?php
declare(strict_types=1);

namespace Poke26\App\Handler;

use Poke26\App\ORM\MemoryCache\UserStateMemoryCache;
use Workerman\Connection\TcpConnection;

class ConnectHandler
{
    public static function begin(TcpConnection $connection, UserStateMemoryCache $cache): void
    {
        $cache->insert($connection);
    }

    public static function end(TcpConnection $connection, UserStateMemoryCache $cache): void
    {
        $cache->delete($connection->id);
    }
}