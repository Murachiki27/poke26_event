<?php
declare(strict_types=1);

namespace Poke26\Api\Response;

use Override;

class Response
{
    public function render(): void
    {
    }

    public static function empty(): self
    {
        return new self();
    }

    public static function json(mixed $data): self
    {
        return new class($data) extends Response {
            public function __construct(
                private mixed $data
            ) {}

            #[Override]
            public function render(): void
            {
                header('Content-Type: application/json');
                echo json_encode($this->data);
            }
        };
    }
}