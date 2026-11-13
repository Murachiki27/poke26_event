<?php
declare(strict_types=1);

namespace Poke26\App\Sender;

use Workerman\Connection\TcpConnection;

class Sender
{
    public static function battleStart(TcpConnection $connection): void
    {
        $connection->send(json_encode(['type' => 'battle_start']));
    }
}