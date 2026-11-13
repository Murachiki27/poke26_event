<?php
declare(strict_types=1);

namespace App\Repo\Raw;

use App\Entity\Poke;
use App\State\PokeState;

class UserStateRepo {

    private static array $cache = [];
    
    public static function insert(
        int $user_id,
        int $connection_id,
    ): void {
        self::$cache[$user_id] = [
            'cid' => $connection_id,
            'duel' => [
                'rival_user_id' => null,
                'ready' => false,
                'next' => null,
                'current' => 0,
                'pokes' => [],
            ],
        ];
    }
    
    
    /**
     * @param int $user_id
     * @param Poke[] $pokes
     */
    public static function updatePokesAndReady(
        int $user_id,
        array $pokes,
    ): void {
        if (!isset(self::$cache[$user_id])) {
            return;
        }
        self::$cache[$user_id]['duel']['ready'] = true;
        self::$cache[$user_id]['duel']['current'] = 0;
        self::$cache[$user_id]['duel']['next'] = null;
        $res = [];
        foreach ($pokes as $poke) {
            $res[] = new PokeState($poke);
        }
        self::$cache[$user_id]['duel']['pokes'] = $res;
    }

    public static function delete(int $user_id): void
    {
        unset(self::$cache[$user_id]);
    }

    public static function fetch(): array
    {
        return self::$cache;
    }
}
