<?php
declare(strict_types=1);

namespace Poke26\App\ORM\UseCase;

use Poke26\App\ORM\Cache\ConnectionCache;
use Poke26\App\ORM\Repository\UserRepository;
use Poke26\App\ORM\Repository\UserSessionRepository;
use Poke26\App\ORM\State\ConnectionState;
use Workerman\Connection\TcpConnection;

final class ConnectionUseCase
{

    private UserRepository $user_repo;
    private UserSessionRepository $user_session_repo;
    private ConnectionCache $cache;


    public function register(TcpConnection $connection, string $username): void
    {
        $session_id = bin2hex(random_bytes(16));
        $new_user_id = (int)$this->user_repo->insert([
            'name' => $username,
            'password' => '',
        ]);
        $this->user_session_repo->insert([
            'id' => $session_id,
            'user_id' => $new_user_id,
        ]);

        $this->cache->insert($connection, $session_id, $new_user_id);
    }
}