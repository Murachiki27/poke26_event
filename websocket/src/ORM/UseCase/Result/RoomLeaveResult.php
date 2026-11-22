<?php
declare(strict_types=1);

namespace Poke26\App\ORM\UseCase\Result;

use Poke26\App\ORM\State\RoomState;
use Workerman\Connection\TcpConnection;

final class RoomLeaveResult
{
    public function __construct(
        readonly TcpConnection $connection,
        readonly RoomState $room_state,
        readonly bool $leave
    ) {
    }
}