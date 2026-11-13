<?php
declare(strict_types=1);

namespace Poke26\Api\ORM\Entity;

use DateTimeImmutable;

final class User
{
    public function __construct(
        readonly int $id,
        readonly string $name,
        readonly string $password,

        readonly DateTimeImmutable $updated,
        readonly DateTimeImmutable $created,
    ) {}

    public static function of(array $data): self
    {
        return new self(
            $data['id'],
            $data['name'],
            $data['password'],
            new DateTimeImmutable($data['updated']),
            new DateTimeImmutable($data['created']),
        );
    }
}