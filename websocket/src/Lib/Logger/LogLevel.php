<?php
declare(strict_types=1);

namespace Poke26\App\Lib\Logger;

enum LogLevel: int
{
    case CRITICAL = 0;
    case ERROR = 1;
    case WARNING = 2;
    case NOTICE = 3;
    case INFO = 4;
    case DEBUG = 5;
}