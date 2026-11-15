<?php
declare(strict_types=1);

namespace Poke26\App;

use Poke26\App\Handler\ConnectHandler;
use Poke26\App\Handler\MessageHandler;
use Poke26\App\Lib\Db\Db;
use Poke26\App\Lib\MemoryCache;
use Poke26\App\ORM\MemoryCache\ConnectionMemoryCache;
use Poke26\App\ORM\MemoryCache\RoomMemoryCache;
use Poke26\App\ORM\MemoryCache\UserStateMemoryCache;
use Throwable;
use Workerman\Worker;
use Workerman\Connection\TcpConnection;

class App
{
    private Worker $ws;
    private MemoryCache $cache;
    private Db $db;

    public function __construct(Db $db)
    {
        $ws = new Worker(WEBSOCKET_NAME);
        $ws->count = 1;
        $ws->onWorkerStart = $this->onWorkerStart(...);
        $ws->onConnect = $this->onConnect(...);
        $ws->onClose = $this->onClose(...);
        $ws->onMessage = $this->onMessage(...);
        $this->ws = $ws;

        $this->cache = new MemoryCache();
        $this->db = $db;
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
        // $usm = new UserStateMemoryCache($this->cache);
        $csm = new ConnectionMemoryCache($this->cache);
        ConnectHandler::begin($connection, $csm);
    }

    private function onClose(TcpConnection $connection): void
    {
        echo "Client disconnected at {$connection->id}\n";
        // $usm = new UserStateMemoryCache($this->cache);
        $csm = new ConnectionMemoryCache($this->cache);
        $rsm = new RoomMemoryCache($this->cache);
        ConnectHandler::end($connection, $this->db, $csm, $rsm);
    }

    private function onMessage(TcpConnection $connection, mixed $data): void
    {
        /** @var array */
        $message = json_decode($data, true);

        // $usm = new UserStateMemoryCache($this->cache);
        $csm = new ConnectionMemoryCache($this->cache);
        $rsm = new RoomMemoryCache($this->cache);
        $conn_state = $csm->fetch($connection->id);
        $user_id = $message['user_id'] ?? null;

        if ($user_id === null) {
            echo $connection->id . ': user_id does not found.';
            return;
        }
        // user_id が登録されているものと違うなら接続断
        if ($conn_state !== null && $user_id !== $conn_state->user_id) {
            $connection->close();
            echo $connection->id . ': user_id changed. connection close. old:' . $conn_state->user_id . ', new:' . $user_id;
            return;
        }

        try {
            MessageHandler::on($connection, $this->db, $csm, $rsm, $user_id, $message);
        } catch (Throwable $t) {
            echo $t->getMessage() . ', Cause:' .$t->getTraceAsString();
        }
    }
}