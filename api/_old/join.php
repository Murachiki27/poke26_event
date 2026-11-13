<?php
declare(strict_types=1);
require_once __DIR__ . '/repo/rooms.php';
require_once __DIR__ . '/util/codegen.php';

require_once __DIR__ . '/util/controller.php';


function get(): void {
    $code = generateCode();
    $user_id = 1;
    
    RoomRepo::insertIgnore(name: "てすとるーむ1", code: $code, user_id: $user_id);

}

function put(): void {
    MySql::poke26()->insert("INSERT INTO trx_users (name, password) VALUES ('あああ', '')");
}

