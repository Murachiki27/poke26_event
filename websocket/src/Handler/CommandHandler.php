<?php
declare(strict_types=1);

namespace Poke26\App\Handler;

use Poke26\App\Exception\CacheNotFoundException;
use Poke26\App\Lib\Db\Db;
use Poke26\App\Lib\MemoryCache;
use Poke26\App\ORM\Cache\ConnectionCache;
use Poke26\App\ORM\Cache\RoomCache;
use Poke26\App\ORM\MemoryCache\ConnectionMemoryCache;
use Poke26\App\ORM\MemoryCache\RoomMemoryCache;
use Poke26\App\ORM\MemoryCache\UserStateMemoryCache;
use Poke26\App\ORM\Repository\RoomRepository;
use Poke26\App\ORM\Repository\UserRepository;
use Poke26\App\ORM\State\ConnectionState;
use Poke26\App\ORM\State\RoomState;
use Poke26\App\ORM\State\UserState;
use Poke26\App\ORM\UseCase\ConnectionUseCase;
use Poke26\App\ORM\UseCase\RoomUseCase;
use Poke26\App\Sender\Sender;
use Workerman\Connection\TcpConnection;
use Workerman\Timer;

final class CommandHandler
{
    public static function on(TcpConnection $connection, MemoryCache $cache, Db $db, array $data): void
    {
        match ($data['type']) {
            'register' => self::onRegister($connection, $cache, $db, $data),
            'rooms' => self::onRooms($connection, $cache, $db, $data),
            'create' => self::onCreate($connection, $cache, $db, $data),
            'join' => self::onJoin($connection, $cache, $db, $data),
            'leave' => self::onLeave($connection, $cache, $db, $data),

            'ready' => self::onReady($connection, $cache, $db, $data),

            'debug' => self::debug($connection, $cache, $db, $data),
        };
    }

    private static function onRegister(TcpConnection $connection, MemoryCache $cache, Db $db, array $data): void
    {
        $conn_cache = new ConnectionCache($cache);
        $user_repo = new UserRepository($db);

        $use_case = new ConnectionUseCase($conn_cache, $user_repo);
        $session_id = $use_case->register($connection, $data['username']);
        Sender::registerUser($connection, $session_id);
    }

    private static function onRooms(TcpConnection $connection, MemoryCache $cache, Db $db, array $data): void
    {
        $user_repo = new UserRepository($db);
        $conn_cache = new ConnectionCache($cache);
        $room_cache = new RoomCache($cache);

        $use_case = new RoomUseCase($user_repo, $conn_cache, $room_cache);
        $room_states = $use_case->list($connection, $data['session_id']);
        Sender::list($connection, $room_states);
    }

    private static function onCreate(TcpConnection $connection, MemoryCache $cache, Db $db, array $data): void
    {
        $user_repo = new UserRepository($db);
        $conn_cache = new ConnectionCache($cache);
        $room_cache = new RoomCache($cache);

        $use_case = new RoomUseCase($user_repo, $conn_cache, $room_cache);
        $room_state = $use_case->create($connection, $data['session_id'], $data['name']);

        Sender::roomCreated($connection, $room_state);
        foreach ($room_state->getConnectionIds() as $connection_id) {
            $conn_state = $conn_cache->fetch($connection_id);
            if ($conn_state !== null) {
                Sender::roomUserUpdated($conn_state->connection, $room_state);
            }
        }
    }

    private static function onJoin(TcpConnection $connection, MemoryCache $cache, Db $db, array $data): void
    {
        $user_repo = new UserRepository($db);
        $conn_cache = new ConnectionCache($cache);
        $room_cache = new RoomCache($cache);

        $use_case = new RoomUseCase($user_repo, $conn_cache, $room_cache);
        $room_state = $use_case->join($connection, $data['session_id'], $data['code']);
        foreach ($room_state->getConnectionIds() as $connection_id) {
            $conn_state = $conn_cache->fetch($connection_id);
            if ($conn_state !== null) {
                Sender::roomUserUpdated($conn_state->connection, $room_state);
            }
        }
    }

    private static function onReady(TcpConnection $connection, MemoryCache $cache, Db $db, array $data): void
    {
        $user_repo = new UserRepository($db);
        $conn_cache = new ConnectionCache($cache);
        $room_cache = new RoomCache($cache);

        $use_case = new RoomUseCase($user_repo, $conn_cache, $room_cache);
        $result = $use_case->ready($connection, $data['session_id'], $data['state']);

        if ($result !== null) {
            if ($result->start) {
                $timer_id = Timer::add(1, function () use ($result) {
                    $room_state = $result->room_state;
                    $connections = $result->connections;
                    if (!$room_state->isReadyStart()) {
                        foreach ($connections as $c) {
                            Sender::roomReady($c, $room_state->getReadyCount());
                        }
                        $room_state->incrementReadyCount();
                    } else {
                        if ($room_state->getReadyTimerId() !== null) {
                            Timer::del($room_state->getReadyTimerId());
                            $room_state->clearReadyTimerId();
                        }
                        foreach ($connections as $c) {
                            Sender::battleStart($c);
                        }
                    }
                });
                foreach ($result->connections as $c) {
                    Sender::roomUserUpdated($c, $result->room_state);
                }
                $result->room_state->setReadyTimerId($timer_id);
            } else {
                $cancel = false;
                if ($result->room_state->getReadyTimerId() !== null) {
                    $cancel = true;
                    Timer::del($result->room_state->getReadyTimerId());
                    $result->room_state->clearReadyTimerId();
                }
                $result->room_state->resetReadyCount();
                foreach ($result->connections as $c) {
                    if ($cancel) {
                        Sender::roomReadyCancel($c);
                    }
                    Sender::roomUserUpdated($c, $result->room_state);
                }
            }
        }
    }

    private static function onLeave(TcpConnection $connection, MemoryCache $cache, Db $db, array $data): void
    {
        $user_repo = new UserRepository($db);
        $conn_cache = new ConnectionCache($cache);
        $room_cache = new RoomCache($cache);

        $use_case = new RoomUseCase($user_repo, $conn_cache, $room_cache);
        $results = $use_case->leave($connection, $data['session_id']);

        foreach ($results as $result) {
            if ($result->leave) {
                Sender::roomLeft($result->connection);
            } else {
                Sender::roomUserUpdated($result->connection, $result->room_state);
            }
        }
    }

    private static function debug(TcpConnection $connection, MemoryCache $cache, Db $db, array $data): void
    {
        $caches = [];
        foreach ($cache->keys() as $key) {
            $caches[] = $cache->get($key)->toArray();
        }

        $connection->send(json_encode(['cache' => $caches]));
    }
}
