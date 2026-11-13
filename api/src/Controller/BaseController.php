<?php
declare(strict_types=1);

namespace Poke26\Api\Controller;

use Poke26\Api\Exception\Http\HttpNotFoundException;
use Poke26\Api\Lib\Db\Db;
use Poke26\Api\Lib\Request\Request;
use Poke26\Api\Response\Response;

abstract class BaseController
{
    public function get(Request $request, Db $db): Response
    {
        throw new HttpNotFoundException('Unknown');
    }

    public function post(Request $request, Db $db): Response
    {
        throw new HttpNotFoundException('Unknown');
    }

    public function put(Request $request, Db $db): Response
    {
        throw new HttpNotFoundException('Unknown');
    }

    public function delete(Request $request, Db $db): Response
    {
        throw new HttpNotFoundException('Unknown');
    }

    public function patch(Request $request, Db $db): Response
    {
        throw new HttpNotFoundException('Unknown');
    }
}