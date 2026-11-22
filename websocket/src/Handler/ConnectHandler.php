<?php
declare(strict_types=1);

namespace Poke26\App\Handler;

use Poke26\App\Lib\Db\Db;
use Poke26\App\Lib\MemoryCache;
use Poke26\App\ORM\Cache\ConnectionCache;
use Poke26\App\ORM\Cache\RoomCache;
use Poke26\App\ORM\MemoryCache\ConnectionMemoryCache;
use Poke26\App\ORM\MemoryCache\RoomMemoryCache;
use Poke26\App\ORM\Repository\UserRepository;
use Poke26\App\ORM\UseCase\ConnectionUseCase;
use Poke26\App\ORM\UseCase\RoomUseCase;
use Poke26\App\Sender\Sender;
use Workerman\Connection\TcpConnection;

class ConnectHandler
{
    public static function begin(TcpConnection $connection, ConnectionMemoryCache $cache): void
    {
        // $cache->insert($connection);
    }

    // public static function end(TcpConnection $connection, Db $db, ConnectionMemoryCache $conn_cache, RoomMemoryCache $room_cache): void
    public static function end(TcpConnection $connection, Db $db, MemoryCache $cache): void
    {
        // MessageHandler::leave($connection, $db, $conn_cache, $room_cache);
        $conn_cache = new ConnectionCache($cache);
        $user_repo = new UserRepository($db);
        $room_cache = new RoomCache($cache);

        $use_case = new RoomUseCase($user_repo, $conn_cache, $room_cache);
        $results = $use_case->forceLeave($connection);

        // 切断になった際に残されたメンバーに通知する
        foreach ($results as $result) {
            if ($result->leave) {
                Sender::roomLeft($result->connection);
            } else {
                Sender::roomUserUpdated($result->connection, $result->room_state);
            }
        }

        $conn_use_case = new ConnectionUseCase($conn_cache, $user_repo);
        $conn_use_case->delete($connection);
    }
}