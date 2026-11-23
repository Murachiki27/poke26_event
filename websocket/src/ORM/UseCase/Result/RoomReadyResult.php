<?php
declare(strict_types=1);

namespace Poke26\App\ORM\UseCase\Result;

use Poke26\App\ORM\State\RoomState;
use Workerman\Connection\TcpConnection;

final class RoomReadyResult
{
    public function __construct(
        readonly bool $start,
        readonly RoomState $room_state,
        /** @var TcpConnection[] */
        readonly array $connections,
    ) {
    }
}