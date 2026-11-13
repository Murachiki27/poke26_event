<?php
declare(strict_types=1);

require_once __DIR__ . '/vendor/autoload.php';

use App\WorkerApp;
use Workerman\Worker;

// $ws = new Worker('websocket://0.0.0.0:8080');

// $ws->count = 1;

// $ws->onWorkerStart = function () {
//     echo "WebSocket server started\n";
// };

// $ws->onConnect = function ($connection) {
//     echo "Client connected\n";
// };

// $ws->onMessage = function ($connection, $data) use ($ws) {
//     $message = json_decode($data, true);

//     if ($message['type'] == 'JOIN') {
        
//     }
//     if ($message['type'] === 'START') {
//         // $rooms = MySql::poke26()->fetchAll("SELECT * FROM trx_rooms LIMIT 1");

//         // if ($rooms) {
//         //     foreach ($ws->connections as $player_connection) {
//         //         $player_connection->send(json_encode([
//         //             'type' => 'STARTED',
//         //             'message' => 'Start!',
//         //         ]));
//         //     }
//         // }
//     }
// };

// $ws->onClose = function ($connection) {
//     echo "Client disconnected\n";
// };

new WorkerApp()->init();

Worker::runAll();
