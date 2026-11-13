<?php
declare(strict_types=1);

namespace App\State;

use App\Entity\Poke;

class PokeState {
    private int $hp;
    private ?string $status;

    public function __construct(
        readonly Poke $poke,
        ) {
        $this->hp = $poke->max_hp;
        $this->status = null;
    }

}
