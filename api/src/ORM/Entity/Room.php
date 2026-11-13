<?php
declare(strict_types=1);

namespace Poke26\Api\ORM\Entity;

use DateTimeImmutable;

final class Room
{
    public function __construct(
        readonly int $id,
        readonly string $code,
        readonly string $name,

        readonly ?int $user_id_1,
        readonly ?int $user_id_2,

        readonly DateTimeImmutable $created,
    ) {}

    public static function of(array $data): self
    {
        return new self(
            $data['id'],
            $data['code'],
            $data['name'],
            $data['user_id_1'],
            $data['user_id_2'],
            new DateTimeImmutable($data['created']),
        );
    }
}