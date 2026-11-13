<?php
declare(strict_types=1);

namespace Poke26\Api\Exception\Api;

use Throwable;

class ParameterRequiredException extends ApiException
{
    public function __construct(
        string $message = "",
        int $code = 500,
        Throwable|null $previous = null
    ) {
        parent::__construct($message, $code, $previous);
    }
}