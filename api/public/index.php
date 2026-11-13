<?php
declare(strict_types=1);

require_once __DIR__ . "/../config.php";

use Poke26\Api\Controller\BaseController;
use Poke26\Api\Exception\Api\ApiException;
use Poke26\Api\Exception\Api\ApiLogicException;
use Poke26\Api\Exception\Http\HttpException;
use Poke26\Api\Exception\Http\HttpNotFoundException;
use Poke26\Api\Lib\Db\Db;
use Poke26\Api\Lib\Export;
use Poke26\Api\Lib\Request\Request;
use Poke26\Api\Response\Response;

$request_path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
if (!str_starts_with($request_path, '/api/')) {
    Export::httpError(404);
}

$path = implode('\\', array_map(
    fn ($segment) => str_replace(' ', '', ucwords(str_replace(['_', '-'], ' ', $segment))),
    array_filter(explode('/', trim($request_path, '/')))
));

// ディレクトリトラバーサル
if (str_contains($path, '..')) {
    Export::httpError(404);
}

$class_path = 'Poke26\\Api\\Controller\\' . $path . 'Controller';
try {
    $request = Request::create();
    $db = new Db(DB_DSN_POKE26, DB_USERNAME, DB_PASSWORD);
    
    $method = $request->method;
    /**  @var BaseController */
    $controller = new $class_path();
    $res = match ($request->method) {
        'get' => $controller->get($request, $db),
        'post' => $controller->post($request, $db),
        'put' => $controller->put($request, $db),
        'delete' => $controller->delete($request, $db),
        'patch' => $controller->patch($request, $db),
        default => new HttpNotFoundException('Unknown method:'.$method),
    };

    if (!($res instanceof Response)) {
        throw new ApiLogicException('response is not instanceof Response');
    }
    $res->render();
} catch (Throwable $t) {
    if ($t instanceof ApiException) {
        http_response_code($t->getCode());
        error_log($t->getMessage() . 'Cause:' . $t->getTraceAsString());
    } else if ($t instanceof HttpException) {
        http_response_code($t->getCode());
    }
}
