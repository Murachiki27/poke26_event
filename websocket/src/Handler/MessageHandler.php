<?php
declare(strict_types=1);

namespace Poke26\App\Handler;

use Poke26\App\Lib\Db\Db;
use Poke26\App\ORM\MemoryCache\UserStateMemoryCache;
use Poke26\App\ORM\State\UserState;
use Poke26\App\Sender\Sender;
use Workerman\Connection\TcpConnection;

class MessageHandler
{
    public static function user_id(TcpConnection $connection, UserState $user_state, int $user_id): void
    {
        $user_state->setUserId($user_id);
    }

    public static function join(TcpConnection $connection, UserState $user_state, int $user_id): void
    {
        $user_state->setUserId($user_id);
    }

    public static function ready(TcpConnection $connection, Db $db, UserStateMemoryCache $cache, UserState $user_state): void
    {
        $user_state->setReady(true);
        $rival_connection_id = $user_state->getRivalConnectionId();
        if ($rival_connection_id !== null && $cache->has($rival_connection_id)) {
            $rival_user_state = $cache->fetch($rival_connection_id);
            if ($rival_user_state->isReady()) {
                Sender::battleStart($connection);
                Sender::battleStart($rival_user_state->connection);
            }
        }
    }

    public static function debug(TcpConnection $connection, UserStateMemoryCache $cache): void
    {
        $arr = array_map(fn($k) => $cache->fetch((int)substr($k, 3))->asArray(), $cache->fetchKeys());
        $connection->send(json_encode($arr));
    }
}