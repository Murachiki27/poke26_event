<?php
declare(strict_types=1);

namespace Poke26\App\ORM\State;

class Poke
{
    public function __construct(
        readonly int $id,
        readonly ?string $name,
        readonly int $max_hp,
        readonly int $attack,
        readonly int $defense,
        readonly int $speed,
        readonly int $special,
    ) {}
}