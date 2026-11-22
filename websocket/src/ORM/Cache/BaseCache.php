<?php
declare(strict_types=1);

namespace Poke26\App\ORM\Cache;

use Poke26\App\Lib\MemoryCache;

/**
 * @template K
 * @template V
 */
abstract class BaseCache
{
    public function __construct(
        protected readonly MemoryCache $cache
    ) {}

    /**
     * @return K[]
     */
    public function fetchKeys(): array
    {
        return $this->cache->keys();
    }

    /**
     * @return V[]
     */
    public function fetchValues(): array
    {
        return $this->cache->values($this->type());
    }

    protected abstract function type(): string;
}