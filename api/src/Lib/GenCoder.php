<?php
declare(strict_types=1);

namespace Poke26\Api\Lib;

final class GenCoder
{
    public static function generateCode(): string
    {
        $ramdom = new \Random\Randomizer();
        $result = $ramdom->getBytesFromString("01234567", 6);
        return $result;
    }
}