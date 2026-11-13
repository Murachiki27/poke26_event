<?php
declare(strict_types=1);


function generateCode(): string {
    $randomizer = new \Random\Randomizer();
    $result = $randomizer->getBytesFromString("01234567", 6);
    return $result;
}
