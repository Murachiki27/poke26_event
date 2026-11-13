<?php
declare(strict_types=1);

namespace Poke26\Api\Controller\Api;

use Override;
use Poke26\Api\Controller\BaseController;
use Poke26\Api\Exception\Http\HttpNotFoundException;
use Poke26\Api\Lib\Db\Db;
use Poke26\Api\Lib\GenCoder;
use Poke26\Api\Lib\Request\Request;
use Poke26\Api\ORM\Entity\Room;
use Poke26\Api\ORM\Repository\RoomRepository;
use Poke26\Api\ORM\Repository\UserRepository;
use Poke26\Api\Response\Response;

final class RoomController extends BaseController
{
    #[Override]
    public function get(Request $request, Db $db): Response
    {
        $room_repo = new RoomRepository($db);
        /** @var Room[] */
        $rooms = $room_repo->fetchAll();

        $names = [];
        foreach ($rooms as $room) {
            $names[] = [
                "id"=> $room->id,
                "name"=> $room->name,
                'count' => $room->user_id_2 !== 0 ? 2 : ($room->user_id_1 !== 0 ? 1 : 0),
            ];
        }
        return Response::json($names);
    }

    #[Override]
    public function post(Request $request, Db $db): Response
    {
        $user_id = $request->getParamStringOrThrow('user_id');
        $code = $request->getParamStringOrThrow('code');

        $room_repo = new RoomRepository($db);
        $user_repo = new UserRepository($db);

        $room_id = $room_repo->fetchFirstByCodeAndJoinable($code);
        $user = $user_repo->fetchFirstById(id: (int)$user_id);

        if ($room_id === null || !$user) {
            throw new HttpNotFoundException();
        }

        $room_repo->updateUserId2($room_id, $user->id);
        return Response::empty();
    }

    #[Override]
    public function put(Request $request, Db $db): Response
    {
        $user_id = $request->getParamStringOrThrow('user_id');
        $name = $request->getParamStringOrThrow('name');
        $code = GenCoder::generateCode();

        $user_repo = new UserRepository($db);
        $room_repo = new RoomRepository($db);

        $user = $user_repo->fetchFirstById(id: (int)$user_id);
        if (!$user) {
            throw new HttpNotFoundException();
        }

        $room_repo->insert([
            'name'=> $name,
            'code'=> $code,
            'user_id_1'=> $user->id,
            'user_id_2'=> 0,
            'status'=> 'matching',
        ]);
        return Response::json(['code' => $code]);
    }
}
