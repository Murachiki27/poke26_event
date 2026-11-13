<?php
declare(strict_types=1);

namespace Poke26\Api\Exception\Http;

use Throwable;

final class HttpNotFoundException extends HttpException
{
    public function __construct(
        string $message = "",
        int $code = 404,
        Throwable|null $previous = null
    ) {
        parent::__construct($message, $code, $previous);
    }
}