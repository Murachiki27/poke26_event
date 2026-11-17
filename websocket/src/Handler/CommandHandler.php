<?php
declare(strict_types=1);

namespace Poke26\App\Handler;

use Poke26\App\Exception\CacheNotFoundException;
use Poke26\App\Lib\Db\Db;
use Poke26\App\ORM\MemoryCache\ConnectionMemoryCache;
use Poke26\App\ORM\MemoryCache\RoomMemoryCache;
use Poke26\App\ORM\MemoryCache\UserStateMemoryCache;
use Poke26\App\ORM\Repository\RoomRepository;
use Poke26\App\ORM\Repository\UserRepository;
use Poke26\App\ORM\State\ConnectionState;
use Poke26\App\ORM\State\RoomState;
use Poke26\App\ORM\State\UserState;
use Poke26\App\Sender\Sender;
use Workerman\Connection\TcpConnection;

class CommandHandler
{
    public static function on(TcpConnection $connection, Db $db, ConnectionMemoryCache $conn_cache, RoomMemoryCache $room_cache, int $user_id, array $data): void
    {
        match ($data['type']) {
        };
    }
}
