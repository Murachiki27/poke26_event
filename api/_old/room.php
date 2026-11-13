<?php
declare(strict_types=1);
require_once __DIR__ . '/repo/users.php';
require_once __DIR__ . '/repo/rooms.php';
require_once __DIR__ . '/util/codegen.php';

require_once __DIR__ . '/util/controller.php';

// room find
function get(): void {
    
    Response::setJson(RoomRepo::fetchAll());
}

// room in
function post(): void {

    $code = Request::getParam('code');
    $user_id = Request::getParam('user_id');

    $joinable_room = RoomRepo::fetchFirstByCodeAndJoinable($code);
    $user = UserRepo::fetchFirstById(id: (int)$user_id);

    if (!$joinable_room || !$user) {
        Response::setCode(404);
        return;
    }

    RoomRepo::updateUser2(code: $code, user_id: (int)$user['id']);
}

// room create
function put(): void {
    $user_id = Request::getParam('user_id');
    $code = generateCode();
    $user = UserRepo::fetchFirstById(id: (int)$user_id);

    if (!$user) {
        Response::setCode(404);
        return;
    }

    RoomRepo::insertIgnore(name: "テストルーム", code: $code, user_id: (int)$user['id']);
    Response::setJson([
        'code' => $code,
    ]);
}
