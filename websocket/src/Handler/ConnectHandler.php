<?php
declare(strict_types=1);

namespace Poke26\App\Handler;

use Poke26\App\Lib\Db\Db;
use Poke26\App\ORM\MemoryCache\ConnectionMemoryCache;
use Poke26\App\ORM\MemoryCache\RoomMemoryCache;
use Workerman\Connection\TcpConnection;

class ConnectHandler
{
    public static function begin(TcpConnection $connection, ConnectionMemoryCache $cache): void
    {
        // $cache->insert($connection);
    }

    public static function end(TcpConnection $connection, Db $db, ConnectionMemoryCache $conn_cache, RoomMemoryCache $room_cache): void
    {
        MessageHandler::leave($connection, $db, $conn_cache, $room_cache);
    }
}