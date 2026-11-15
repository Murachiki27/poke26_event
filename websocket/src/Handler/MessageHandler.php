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

class MessageHandler
{
    public static function on(TcpConnection $connection, Db $db, ConnectionMemoryCache $conn_cache, RoomMemoryCache $room_cache, int $user_id, array $data): void
    {
        match ($data['type']) {
            'join' => self::join($connection, $db, $conn_cache, $room_cache, $user_id, $data),
            'leave' => self::leave($connection, $db, $conn_cache, $room_cache),
            'ready' => self::ready($connection, $db, $conn_cache, $room_cache, $user_id, $data),

            'heartbeat' => self::heartbeat($connection),

            'debug' => self::debug($connection, $conn_cache, $room_cache),
        };
    }

    private static function heartbeat(TcpConnection $connection): void
    {
        Sender::heartBeat($connection);
    }

    private static function user_id(TcpConnection $connection, UserState $user_state, int $user_id): void
    {
    }

    private static function join(TcpConnection $connection, Db $db, ConnectionMemoryCache $conn_cache, RoomMemoryCache $room_cache, int $user_id, array $data): void
    {
        $room_id = $data['room_id'] ?? null;
        if ($room_id === null) {
            echo 'join: room_id does not found. id:' . $connection->id;
            return;
        }
        $room_repo = new RoomRepository($db);
        $user_repo = new UserRepository($db);

        $room = $room_repo->fetchFirstByIdAndUserId(id: $room_id, user_id: $user_id);
        $user = $user_repo->fetchFirstById($user_id);

        if ($room !== null && $user !== null) {
            $conn_cache->insert($connection, $room->id, $user_id);

            $room_state = $room_cache->fetch($room->id);
            if ($room_state === null) {
                $room_state = $room_cache->insert($room->id);
            }

            if (!$room_state->hasUser1()) {
                $room_state->setUser1(new UserState(user_id: $user_id, connection_id: $connection->id));
                Sender::joined($connection, 0, $user->name, true);
            } else if (!$room_state->hasUser2()) {
                $room_state->setUser2(new UserState(user_id: $user_id, connection_id: $connection->id));
                foreach ($room_state->getConnectionIds() as $connection_id) {
                    $con = $conn_cache->fetch($connection_id);
                    if ($con !== null) {
                        Sender::joined($con->connection, 1, $user->name, $con->connection->id === $connection_id);
                    }
                }
            }
        }
    }

    private static function ready(TcpConnection $connection, Db $db, ConnectionMemoryCache $conn_cache, RoomMemoryCache $room_cache, int $user_id, array $data): void
    {
        list($conn_state, $room_state, $user_state) = self::getStates($connection->id, $conn_cache, $room_cache);

        $user_state->setReady(true);
        if ($room_state->isAllReady()) {
            foreach ($room_state->getConnectionIds() as $connection_id) {
                $con = $conn_cache->fetch($connection_id);
                if ($con !== null) {
                    Sender::battleStart($con->connection);
                }
            }
        }
    }

    private static function leave(TcpConnection $connection, Db $db, ConnectionMemoryCache $conn_cache, RoomMemoryCache $room_cache): void
    {
        try {
            list($conn_state, $room_state, $user_state) = self::getStates($connection->id, $conn_cache, $room_cache);
        } catch (CacheNotFoundException $e) {
            return;
        }

        $room_repo = new RoomRepository($db);

        $index = $room_state->deleteUser($conn_state->user_id);
        if ($index === 1) {
            // DB からユーザー2を消す
            $room_repo->updateUserId2(id: $conn_state->getRoomId(), old_user_id: $conn_state->user_id, new_user_id: null);
        }

        if (!$room_state->hasUser1()) {
            // ユーザー2がいたら追い出す
            if ($room_state->hasUser2() && $room_state->getUser2()->connection_id !== $connection->id) {
                $user_2_conn_state = $conn_cache->fetch($room_state->getUser2()->connection_id);
                if ($user_2_conn_state !== null) {
                    // ユーザー2の接続を切る
                    $user_2_conn_state->connection->close();
                }
            }
            // 部屋を消す
            $room_cache->delete($conn_state->getRoomId());
            $room_repo->delete(id: $conn_state->getRoomId());
        }
        // 接続情報を消す
        $conn_cache->delete($connection->id);
    }

    private static function debug(TcpConnection $connection, ConnectionMemoryCache $conn_cache, RoomMemoryCache $room_cache): void
    {
        $conns = array_map(function ($k) use ($conn_cache) {
            $c = $conn_cache->fetch((int) substr($k, 3));
            return [ 'user_id' => $c->user_id, 'room_id' => $c->getRoomId() ];
        }, $conn_cache->fetchKeys());
        $rooms = array_map(function ($k) use ($room_cache) {
            $r = $room_cache->fetch((int) substr($k, 3));
            return [
                'user_1' => $r->hasUser1() ? $r->getUser1()->asArray() : null,
                'user_2' => $r->hasUser2() ? $r->getUser2()->asArray() : null,
            ];
        }, $room_cache->fetchKeys());

        $connection->send(json_encode(['connections' => $conns, 'rooms' => $rooms]));
    }

    /**
     * @param int $coonection_id
     * @param ConnectionMemoryCache $conn_cache
     * @param RoomMemoryCache $room_cache
     * @return array{ConnectionState,RoomState,UserState}
     */
    private static function getStates(int $coonection_id, ConnectionMemoryCache $conn_cache, RoomMemoryCache $room_cache): array
    {
        $conn_state = $conn_cache->fetch($coonection_id);
        if ($conn_state === null) {
            throw new CacheNotFoundException('connection cache does not found');
        }
        $room_state = $room_cache->fetch($conn_state->getRoomId());
        if ($room_state === null) {
            throw new CacheNotFoundException('room cache does not found');
        }
        $user_state = $room_state->findUser($conn_state->user_id);
        if ($user_state === null) {
            throw new CacheNotFoundException('user cache does not found');
        }
        return [$conn_state, $room_state, $user_state];
    }
}