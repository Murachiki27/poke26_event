<?php
declare(strict_types=1);

namespace Poke26\Api\Controller\Api;

use Override;
use Poke26\Api\Controller\BaseController;
use Poke26\Api\Lib\Db\Db;
use Poke26\Api\Lib\Request\Request;
use Poke26\Api\ORM\Entity\User;
use Poke26\Api\ORM\Repository\RoomRepository;
use Poke26\Api\ORM\Repository\UserRepository;
use Poke26\Api\Response\Response;

final class UserController extends BaseController
{
    #[Override]
    public function get(Request $request, Db $db): Response
    {
        $user_id = $request->getParamInt('user_id');

        $user_repo = new UserRepository($db);
        $room_repo = new RoomRepository($db);
        if ($user_id !== null) {
            $room = $room_repo->fetchFirstByUserId($user_id);
            $user = $user_repo->fetchFirstById($user_id);
            $res = [];
            if ($user !== null) {
                $res = [
                    'id' => $user->id,
                    'name' => $user->name,
                ];
            }
            if ($room !== null) {
                $res['room_id'] = $room->id;
                $res['room_code'] = $room->code;
            }
            return Response::json($res);
        } else {
            /** @var User[] */
            $users = $user_repo->fetchAll();
            $names = [];
            foreach ($users as $user) {
                $names[] = [
                    "id"=> $user->id,
                    "name"=> $user->name,
                ];
            }

            return Response::json($names);
        }
    }

    #[Override]
    public function post(Request $request, Db $db): Response
    {
        $name = $request->getParamStringOrThrow('name');

        $user_repo = new UserRepository($db);
        $user_repo->insert([
            'name' => $name,
            'password' => '',
        ]);

        return Response::empty();
    }
}
