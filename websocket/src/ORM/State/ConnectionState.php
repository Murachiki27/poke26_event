<?php
declare(strict_types=1);

namespace Poke26\App\ORM\State;

use Workerman\Connection\TcpConnection;

final class ConnectionState
{
    public function __construct(
        readonly TcpConnection $connection,
        private int $room_id,
        readonly int $user_id,
    ) {}

    public function getRoomId(): int
    {
        return $this->room_id;
    }

    public function setRoomId(int $room_id): void
    {
        $this->room_id = $room_id;
    }
}