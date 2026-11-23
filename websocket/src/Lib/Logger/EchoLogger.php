<?php
declare(strict_types=1);

namespace Poke26\App\Lib\Logger;

class EchoLogger extends Logger
{
    public function log(LogLevel $level, string $message): void
    {
        $header = match ($level) {
            LogLevel::DEBUG => "[DEBUG]",
            LogLevel::INFO => "[INFO]",
            LogLevel::NOTICE => "[NOTICE]",
            LogLevel::WARNING => "[WARNING]",
            LogLevel::ERROR => "[ERROR]",
            LogLevel::CRITICAL => "[CRITICAL]",
        };

        echo '[' . date('Y-m-d H:i:s') . ']:' . $header . ' ' . $message;
    }
}