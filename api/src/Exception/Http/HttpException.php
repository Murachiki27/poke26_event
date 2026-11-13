<?php
declare(strict_types=1);

namespace Poke26\Api\Exception\Http;

use Exception;
use Throwable;

abstract class HttpException extends Exception
{
    public function __construct(
        string $message = "",
        int $code = 0,
        Throwable|null $previous = null
    ) {
        parent::__construct($message, $code, $previous);
    }
}