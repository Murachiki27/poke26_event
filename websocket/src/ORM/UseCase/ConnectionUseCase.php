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
    // private UserSessionRepository $user_session_repo;

    public function __construct(
        private readonly ConnectionCache $cache,
        private readonly UserRepository $user_repo,
    ) {
    }

    public function register(TcpConnection $connection, string $username): string
    {
        $session_id = bin2hex(random_bytes(16));
        $user_id = (int)$this->user_repo->insertIgnore([
            'name' => $username,
            'password' => '',
        ]);
        if ($this->user_repo->affectedRows() === 0) {
            $user = $this->user_repo->fetchFirstByName($username);
            $user_id = $user->id;
        }
        // $this->user_session_repo->insert([
        //     'id' => $session_id,
        //     'user_id' => $new_user_id,
        // ]);

        $this->cache->insert($connection, $session_id, $user_id);
        return $session_id;
    }

    public function delete(TcpConnection $connection): void
    {
        $this->cache->delete($connection->id);
    }
}