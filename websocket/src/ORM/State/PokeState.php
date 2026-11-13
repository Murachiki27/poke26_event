<?php
declare(strict_types=1);

namespace Poke26\App\ORM\State;

class PokeState
{
    public function __construct(
        readonly Poke $poke,
        private int $hp,
        private ?string $status,
    ) {}

    public function asArray(): array
    {
        return [
            "id" => $this->poke->id,
            "name" => $this->poke->name,
            "hp" => $this->hp,
            "status" => $this->status,
        ];
    }
}