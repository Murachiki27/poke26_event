<?php
declare(strict_types=1);

namespace App;

use App\Event\JoinEvent;
use App\Event\LeaveEvent;
use App\Repo\Raw\ConnectionRepo;
use Workerman\Worker;
use Workerman\Connection\TcpConnection;

class WorkerApp {

    private Worker $ws;

    public function __construct()
    {
        $this->ws = new Worker('websocket://0.0.0.0:8080');
    }

    public function init(): void
    {
        $this->ws->count = 1;
        $this->ws->onWorkerStart = $this->onWorkerStart(...);
        $this->ws->onConnect = $this->onConnect(...);
        $this->ws->onClose = $this->onClose(...);
        $this->ws->onMessage = $this->onMessage(...);
    }

    public function onWorkerStart(): void
    {
        echo "WebSocket server started\n";
    }

    private function onConnect(TcpConnection $connection): void
    {
        echo "Client connected from app\n";
        ConnectionRepo::insert($connection);
    }

    private function onClose(TcpConnection $connection): void
    {
        echo "Client disconnected from app\n";
        ConnectionRepo::delete($connection);
    }

    private function onMessage(TcpConnection $connection, mixed $data): void
    {
        /** @var array */
        $message = json_decode($data, true);

        try {
            $user_id = $message['user_id'];

            match ($message['type']) {
                'join' => JoinEvent::run($connection->id, $user_id, $message),
                'leave' => LeaveEvent::run($user_id),

                'debug' => JoinEvent::debug($connection),
            };
        } catch (\Throwable $e) {
            echo $e->getMessage() . ', Cause:' .$e->getTraceAsString();
        }
    }
}