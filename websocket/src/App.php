<?php
declare(strict_types=1);

namespace Poke26\App;

use Poke26\App\Handler\CommandHandler;
use Poke26\App\Handler\ConnectHandler;
use Poke26\App\Handler\MessageHandler;
use Poke26\App\Lib\Db\Db;
use Poke26\App\Lib\MemoryCache;
use Poke26\App\ORM\MemoryCache\ConnectionMemoryCache;
use Poke26\App\ORM\MemoryCache\RoomMemoryCache;
use Poke26\App\ORM\MemoryCache\UserStateMemoryCache;
use Throwable;
use Workerman\Protocols\Websocket;
use Workerman\Timer;
use Workerman\Worker;
use Workerman\Connection\TcpConnection;

class App
{
    private Worker $ws;
    private MemoryCache $cache;
    private Db $db;
    private array $lastActiveTimes = [];

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
        // 30秒ごとに全クライアントへPingフレームを送信
        Timer::add(30, function () {
            foreach ($this->ws->connections as $connection) {
                // Pingフレームのオペコード (0x9) を指定して送信
                $connection->send(pack('H*', '8900'), true);
            }
        });
        Timer::add(5, function () {
            $time_now = time();
            foreach ($this->ws->connections as $connection) {
                $lastTime = $this->lastActiveTimes[$connection->id] ?? $time_now;
                if ($time_now - $lastTime >= 300) {
                    $connection->send(json_encode(['type' => 'idle_timeout'], JSON_UNESCAPED_UNICODE));
                    $connection->close();
                    // onClose が呼ばれるため unset されますが、念のためここでも削除可能
                    unset($this->lastActiveTimes[$connection->id]);
                }
            }
        });
    }

    private function onConnect(TcpConnection $connection): void
    {
        echo "Client connected at {$connection->id}\n";
        $this->lastActiveTimes[$connection->id] = time();
        // $usm = new UserStateMemoryCache($this->cache);
        $csm = new ConnectionMemoryCache($this->cache);
        ConnectHandler::begin($connection, $csm);
    }

    private function onClose(TcpConnection $connection): void
    {
        echo "Client disconnected at {$connection->id}\n";
        unset($this->lastActiveTimes[$connection->id]);
        // $usm = new UserStateMemoryCache($this->cache);
        // $csm = new ConnectionMemoryCache($this->cache);
        // $rsm = new RoomMemoryCache($this->cache);
        ConnectHandler::end($connection, $this->db, $this->cache);
    }

    private function onMessage(TcpConnection $connection, mixed $data): void
    {
        /** @var array */
        $message = json_decode($data, true);

        // // $usm = new UserStateMemoryCache($this->cache);
        // $csm = new ConnectionMemoryCache($this->cache);
        // $rsm = new RoomMemoryCache($this->cache);
        // $conn_state = $csm->fetch($connection->id);
        // $user_id = $message['user_id'] ?? null;

        // if ($user_id === null) {
        //     echo $connection->id . ': user_id does not found.';
        //     return;
        // }
        // // user_id が登録されているものと違うなら接続断
        // if ($conn_state !== null && $user_id !== $conn_state->user_id) {
        //     $connection->close();
        //     echo $connection->id . ': user_id changed. connection close. old:' . $conn_state->user_id . ', new:' . $user_id;
        //     return;
        // }

        try {
            $this->lastActiveTimes[$connection->id] = time();
            CommandHandler::on($connection, $this->cache, $this->db, $message);
            // MessageHandler::on($connection, $this->db, $csm, $rsm, $user_id, $message);
        } catch (Throwable $t) {
            echo 'id: ' . $connection->id . ', type:' . $message['type'] . PHP_EOL;
            echo $t->getMessage() . ', Cause:' .$t->getTraceAsString() . PHP_EOL;
        }
    }
}