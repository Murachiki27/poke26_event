<?php
declare(strict_types=1);

namespace Poke26\App\Exception;

use Exception;

class CacheNotFoundException extends Exception
{
    public function __construct(
        string $message = "",
        int $code = 0,
        ?Exception $previous = null
    ) {
        parent::__construct($message, $code, $previous);
    }
}