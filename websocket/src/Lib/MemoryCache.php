<?php
declare(strict_types=1);

namespace Poke26\App\Lib;

class MemoryCache
{
    private $cache = [];

    public function set(string $key, mixed $value): void
    {
        $this->cache[$key] = $value;
    }

    public function get(string $key): mixed
    {
        return $this->cache[$key] ?? null;
    }

    public function has(string $key): bool
    {
        return isset($this->cache[$key]);
    }

    public function delete(string $key): void
    {
        unset($this->cache[$key]);
    }

    public function keys(): array
    {
        return array_keys($this->cache);
    }

    public function values(?string $type): array
    {
        if ($type === null) {
            return array_values($this->cache);
        }
        $results = [];
        foreach ($this->cache as $key => $value) {
            if (str_starts_with($key, $type)) {
                $results[] = $value;
            }
        }
        return $results;
    }
}