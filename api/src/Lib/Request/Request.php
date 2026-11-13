<?php
declare(strict_types=1);

namespace Poke26\Api\Lib\Request;

use Poke26\Api\Exception\Api\ParameterRequiredException;

final class Request
{
    public readonly string $method;
    public readonly string $content_type;
    private array $params;

    public function __construct(string $content_type, string $method, array $params)
    {
        $this->content_type = $content_type;
        $this->method = $method;
        $this->params = $params;
    }

    public function getParamString(string $name): ?string
    {
        return $this->params[$name] ?? null;
    }

    public function getParamStringOrThrow(string $name): string
    {
        return $this->getParamString($name) ?? throw new ParameterRequiredException('required '. $name);
    }

    public static function create(): self
    {
        $content_type = $_SERVER['CONTENT_TYPE'] ?? $_SERVER['HTTP_CONTENT_TYPE'] ?? '';
        $method = strtolower($_SERVER['REQUEST_METHOD']);
        $params = match ($method) {
            'get' => $_GET,
            'post' => str_contains($content_type, 'application/json') ? (json_decode(file_get_contents('php://input'), true) ?? []) : $_POST,
            'put', 'patch', 'delete' =>
                (function () use ($content_type) {
                    $input = file_get_contents('php://input');
                    if (str_contains($content_type, 'application/json')) {
                        return json_decode($input, true) ?? [];
                    }
                    parse_str($input, $params);

                    return $params;
                })(),
            default => [],
        };

        if (isset($params['method']) && in_array($params['method'], ['get', 'post', 'put', 'patch', 'delete'], true)) {
            $method = $params['method'];
        }

        return new self($content_type, $method, $params);
    }
}