<?php
declare(strict_types=1);

namespace Poke26\App;

use Poke26\App\Handler\ConnectHandler;
use Poke26\App\Handler\MessageHandler;
use Poke26\App\Lib\Db\Db;
use Poke26\App\Lib\MemoryCache;
use Poke26\App\ORM\MemoryCache\UserStateMemoryCache;
use Throwable;
use Workerman\Worker;
use Workerman\Connection\TcpConnection;

class App
{
    private Worker $ws;
    private MemoryCache $cache;
    private Db $db;

    public function __construct()
    {
        $ws = new Worker(WEBSOCKET_NAME);
        $ws->count = 1;
        $ws->onWorkerStart = $this->onWorkerStart(...);
        $ws->onConnect = $this->onConnect(...);
        $ws->onClose = $this->onClose(...);
        $ws->onMessage = $this->onMessage(...);
        $this->ws = $ws;

        $this->cache = new MemoryCache();
        $this->db = new Db(DB_DSN_POKE26, DB_USERNAME, DB_PASSWORD);
    }

    public function run(): void
    {
        Worker::runAll();
    }

    private function onWorkerStart(): void
    {
        echo "WebSocket server started\n";
    }

    private function onConnect(TcpConnection $connection): void
    {
        echo "Client connected at {$connection->id}\n";
        $usm = new UserStateMemoryCache($this->cache);
        ConnectHandler::begin($connection, $usm);
    }

    private function onClose(TcpConnection $connection): void
    {
        echo "Client disconnected at {$connection->id}\n";
        $usm = new UserStateMemoryCache($this->cache);
        ConnectHandler::end($connection, $usm);
    }

    private function onMessage(TcpConnection $connection, mixed $data): void
    {
        /** @var array */
        $message = json_decode($data, true);

        $usm = new UserStateMemoryCache($this->cache);
        $user_state = $usm->fetch($connection->id);
        $user_id = $message['user_id'] ?? null;

        if ($user_id === null) {
            return;
        }
        // user_id が登録されているものと違うなら接続断
        if ($user_state->getUserId() !== null && $user_id !== $user_state->getUserId()) {
            $connection->close();
            return;
        }

        try {
            if ($user_state !== null) {
                match ($message['type']) {
                    'user_id' => MessageHandler::user_id($connection, $user_state, $user_id),

                    'join' => MessageHandler::user_id($connection, $user_state, $user_id),
                    'ready' => MessageHandler::ready($connection, $this->db, $usm, $user_state),

                    'debug' => MessageHandler::debug($connection, $usm),
                };
            }
        } catch (Throwable $t) {
            echo $t->getMessage() . ', Cause:' .$t->getTraceAsString();
        }
    }
}