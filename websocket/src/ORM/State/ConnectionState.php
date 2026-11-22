<?php
declare(strict_types=1);

namespace Poke26\App\ORM\State;

use Workerman\Connection\TcpConnection;

final class ConnectionState
{
    public function __construct(
        readonly TcpConnection $connection,
        readonly string $session_id,
        readonly int $user_id,
        private ?string $room_code = null,
    ) {}

    public function isJoinedRoom(): bool
    {
        return $this->room_code !== null;
    }
    
    public function getRoomCode(): ?string
    {
        return $this->room_code;
    }

    public function setRoomCode(string $room_code): void
    {
        $this->room_code = $room_code;
    }

    public function clearRoomCode(): void
    {
        $this->room_code = null;
    }

    public function toArray(): array
    {
        return [
            'id' => $this->connection->id,
            'session_id' => $this->session_id,
            'user_id' => $this->user_id,
            'room_code' => $this->room_code,
        ];
    }
}