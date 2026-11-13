<?php
declare(strict_types=1);

namespace App\Event;

use App\Repo\Raw\UserStateRepo;

class LeaveEvent {

    public static function run(int $user_id): void
    {
        UserStateRepo::delete($user_id);
    }
}