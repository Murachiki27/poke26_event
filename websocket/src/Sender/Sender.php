<?php
declare(strict_types=1);

namespace Poke26\App\Sender;

use Workerman\Connection\TcpConnection;

class Sender
{
    public static function heartBeat(TcpConnection $connection): void
    {
        $connection->send(json_encode(['type' => 'heartbeat', 'status' => 'ok']));
    }

    public static function joined(TcpConnection $connection, int $index, string $user_name, bool $is_me): void
    {
        $connection->send(json_encode([
            'type' => 'joined',
            'index' => $index,
            'user_name'=> $user_name,
            'is_me' => $is_me,
        ]));
    }

    public static function battleStart(TcpConnection $connection): void
    {
        $connection->send(json_encode(['type' => 'battle_start']));
    }
}