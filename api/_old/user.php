<?php
declare(strict_types=1);
require_once __DIR__ . '/repo/users.php';

require_once __DIR__ . '/util/controller.php';


function get(): void {
    Response::setJson(UserRepo::fetchAll());
}

function post(): void {
    $name = Request::getParam('name');
    UserRepo::insert(name: $name);
}
