<?php
declare(strict_types=1);

namespace Poke26\Api\Lib;

final class Export
{
    public static function httpError(int $code): never
    {
        http_response_code($code);
        exit;
    }
}
