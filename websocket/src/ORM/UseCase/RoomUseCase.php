<?php
declare(strict_types=1);

namespace Poke26\App\ORM\UseCase;

use Poke26\App\ORM\Cache\ConnectionCache;
use Poke26\App\ORM\Cache\RoomCache;
use Poke26\App\ORM\Repository\RoomRepository;
use Poke26\App\ORM\Repository\UserRepository;
use Poke26\App\ORM\Repository\UserSessionRepository;
use Poke26\App\ORM\State\ConnectionState;
use Workerman\Connection\TcpConnection;

final class RoomUseCase
{

    private RoomRepository $room_repo;
    private UserRepository $user_repo;
    private UserSessionRepository $user_session_repo;
    private ConnectionCache $conn_cache;
    private RoomCache $room_cache;


    public function create(TcpConnection $connection, ConnectionState $conn_state, string $name): void
    {
        $code = self::generateCode();
        $this->room_repo->insert([
            'name' => $name,
            'code'=> $code,
            'user_id_1' => $conn_state->user_id,
        ]);

        $this->room_cache->insert($connection, $session_id, $new_user_id);
    }

    public static function generateCode(): string
    {
        $ramdom = new \Random\Randomizer();
        $result = $ramdom->getBytesFromString("01234567", 6);
        return $result;
    }
}