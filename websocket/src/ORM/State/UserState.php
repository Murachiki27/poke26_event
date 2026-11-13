<?php
declare(strict_types=1);

namespace Poke26\App\ORM\State;

use Workerman\Connection\TcpConnection;

final class UserState
{
    public function __construct(
        readonly TcpConnection $connection,
        private ?int $user_id,
        private ?int $rival_connection_id = null,
        private bool $ready = false,
        private ?object $next = null,

        private int $choose_poke_index = 0,
        /** @var PokeState[] */
        private array $pokes = [],
    ) {}

    public function setUserId(int $user_id): void
    {
        $this->user_id = $user_id;
    }

    public function getUserId(): ?int
    {
        return $this->user_id;
    }

    public function setRivalConnectionId(int $rival_connection_id): void
    {
        $this->rival_connection_id = $rival_connection_id;
    }

    public function getRivalConnectionId(): ?int
    {
        return $this->rival_connection_id;
    }

    public function setReady(bool $ready): void
    {
        $this->ready = $ready;
    }

    public function isReady(): bool
    {
        return $this->ready;
    }

    public function asArray(): array
    {
        return [
            'user_id' => $this->user_id,
            'rival_cid'=> $this->rival_connection_id,
            'ready'=> $this->ready,
            'next'=> $this->next,
            'choose_p_idx'=> $this->choose_poke_index,
            'pokes'=> array_map(fn($s) => $s->asArray(), $this->pokes),
        ];
    }
}