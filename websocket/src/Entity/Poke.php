<?php
declare(strict_types=1);

namespace App\Entity;

class Poke {

    public function __construct(
        readonly int $id,
        readonly string $name,
        readonly int $max_hp,
        readonly int $rank_attack,
        readonly int $rank_defense,
        readonly int $rank_speed,
        readonly int $rank_special,
    ) {
    }
}
