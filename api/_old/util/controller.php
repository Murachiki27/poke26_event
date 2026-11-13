<?php
declare(strict_types=1);

require_once __DIR__ . '/request.php';

$method = Request::getMethod();

try {
    $custom = Request::getParam('method');
    if ($custom) {
        $custom = strtolower($custom);
        if (!in_array($custom, ['get', 'post', 'put', 'delete'], true)) {
            http_response_code(500);
            return;
        }
        $method = $custom;
    }

    $method();
    Response::send();

} catch (\Throwable $t) {
    http_response_code(500);
    error_log($t->getMessage() . $t->getTraceAsString());
}