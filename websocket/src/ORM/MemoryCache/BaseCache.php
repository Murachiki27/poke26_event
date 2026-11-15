<?php
declare(strict_types=1);

namespace Poke26\App\ORM\MemoryCache;

use Poke26\App\Lib\MemoryCache;

abstract class BaseCache
{
    public function __construct(
        protected readonly MemoryCache $cache
    ) {}

    public function fetchKeys(): array
    {
        return $this->cache->keys();
    }
}