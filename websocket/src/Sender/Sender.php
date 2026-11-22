<?php
declare(strict_types=1);

namespace Poke26\App\Sender;

use Poke26\App\ORM\State\RoomState;
use Workerman\Connection\TcpConnection;

class Sender
{
    public static function heartBeat(TcpConnection $connection): void
    {
        $connection->send(json_encode(['type' => 'heartbeat', 'status' => 'ok']));
    }

    public static function registerUser(TcpConnection $connection, string $session_id): void
    {
        $connection->send(json_encode([
            'type' => 'user_created',
            'session_id' => $session_id,
        ]));
    }

    /**
     * @param TcpConnection $connection
     * @param RoomState[] $room_states
     * @return void
     */
    public static function list(TcpConnection $connection, array $room_states): void
    {
        $i = 1;
        $rooms = [];
        foreach ($room_states as $room_state) {
            $rooms[] = [
                'id' => $i++,
                'name' => $room_state->name,
                'count' => $room_state->getUserCount(),
            ];
        }
        $connection->send(json_encode([
            'type' => 'room_list',
            'rooms' => $rooms,
        ]));
    }

    public static function roomCreated(TcpConnection $connection, RoomState $room_state): void
    {
        $connection->send(json_encode([
            'type' => 'room_created',
            'name' => $room_state->name,
            'code' => $room_state->code,
        ]));
    }

    public static function roomUserUpdated(TcpConnection $connection, RoomState $room_state): void
    {
        $users = [];
        if ($room_state->hasUser1()) {
            $user = $room_state->getUser1();
            $users[] = [
                'id' => $user->user_id,
                'name' => $user->name,
                'ready' => $user->isReady(),
            ];
        }
        if ($room_state->hasUser2()) {
            $user = $room_state->getUser2();
            $users[] = [
                'id' => $user->user_id,
                'name' => $user->name,
                'ready' => $user->isReady(),
            ];
        }
        $connection->send(json_encode([
            'type' => 'room_user_updated',
            'users' => $users,
        ]));
    }

    public static function roomLeft(TcpConnection $connection): void
    {
        $connection->send(json_encode([
            'type' => 'room_left',
        ]));
    }

    public static function battleStart(TcpConnection $connection): void
    {
        $connection->send(json_encode(['type' => 'battle_start']));
    }
}