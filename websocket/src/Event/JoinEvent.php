<?php
declare(strict_types=1);

namespace App\Event;

use App\Repo\Raw\UserStateRepo;
use Workerman\Connection\TcpConnection;

class JoinEvent {

    public static function run(int $connection_id, int $user_id, array $message): void
    {
        UserStateRepo::insert($user_id, $connection_id);
    }

    public static function debug(TcpConnection $connection): void
    {
        $data = UserStateRepo::fetch();
        $connection->send(json_encode($data));
    }
}