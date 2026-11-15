<?php
declare(strict_types=1);

namespace Poke26\App\ORM\State;

final class UserState
{
    public function __construct(
        readonly int $user_id,
        readonly int $connection_id,
        private bool $ready = false,
        private ?object $next = null,

        private int $choose_poke_index = 0,
        /** @var PokeState[] */
        private array $pokes = [],
    ) {}

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
            'ready'=> $this->ready,
            'next'=> $this->next,
            'choose_p_idx'=> $this->choose_poke_index,
            'pokes'=> array_map(fn($s) => $s->asArray(), $this->pokes),
        ];
    }
}