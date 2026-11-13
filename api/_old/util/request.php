<?php
declare(strict_types=1);

class Request {
    private static ?array $params = null;

    private static function initParams(): void {
        if (!self::$params) {
            $method = self::getMethod();
            if ($method === 'post') {
                if (strpos($contentType, '/json') !== false) {
                    self::$params = json_decode(file_get_contents('php://input'), true);
                } else {
                    self::$params = $_POST;
                }
            } else {
                self::$params = $_GET;
            }
        }
    }

    public static function getMethod(): string {
        return strtolower($_SERVER['REQUEST_METHOD']);
    }

    public static function getContentType(): string {
        return $_SERVER['CONTENT_TYPE'] ?? $_SERVER['HTTP_CONTENT_TYPE'] ?? '';
    }

    public static function getParam(string $key): ?string {
        self::initParams();
        return self::$params[$key] ?? null;
    }
}

class Response {
    private static ?int $code = null;
    private static ?string $content_type = null;
    private static ?string $response = null;

    public static function setCode(int $code): void {
        self::$code = $code;
    }

    public static function setContentType(string $type): void {
        self::$content_type = $type;
    }

    public static function setBody(string $res): void {
        self::$response = $res;
    }

    public static function setJson(mixed $res): void {
        self::setContentType('application/json');
        self::setBody(json_encode($res));
    }

    public static function send(): void {
        if (self::$code) {
            http_response_code(self::$code);
        }
        if (self::$content_type) {
            header('Content-Type: ' . self::$content_type);
        }
        if (self::$response) {
            echo self::$response;
        }
    }
}


