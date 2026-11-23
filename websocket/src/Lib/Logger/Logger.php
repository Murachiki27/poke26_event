<?php
declare(strict_types=1);

namespace Poke26\App\Lib\Logger;

abstract class Logger
{
    public function info(string $msg): void
    {
        $this->log(LogLevel::INFO, $msg);
    }

    function warning(string $msg): void
    {
        $this->log(LogLevel::WARNING, $msg);
    }

    function error(string $msg): void
    {
        $this->log(LogLevel::ERROR, $msg);
    }

    abstract function log(LogLevel $level, string $msg): void;
}