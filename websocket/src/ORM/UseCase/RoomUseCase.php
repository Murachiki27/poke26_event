<?php
declare(strict_types=1);

namespace Poke26\App\ORM\UseCase;

use Poke26\App\Exception\CacheNotFoundException;
use Poke26\App\ORM\Cache\ConnectionCache;
use Poke26\App\ORM\Cache\RoomCache;
use Poke26\App\ORM\Repository\RoomRepository;
use Poke26\App\ORM\Repository\UserRepository;
use Poke26\App\ORM\Repository\UserSessionRepository;
use Poke26\App\ORM\State\ConnectionState;
use Poke26\App\ORM\State\RoomState;
use Poke26\App\ORM\State\UserState;
use Poke26\App\ORM\UseCase\Result\RoomLeaveResult;
use Workerman\Connection\TcpConnection;

final class RoomUseCase
{

    // private RoomRepository $room_repo;
    // private UserSessionRepository $user_session_repo;

    public function __construct(
        private UserRepository $user_repo,
        private readonly ConnectionCache $conn_cache,
        private readonly RoomCache $room_cache,
    ) {
    }

    /**
     * @param TcpConnection $connection
     * @param string $session_id
     * @throws CacheNotFoundException
     * @return RoomState[]
     */
    public function list(TcpConnection $connection, string $session_id): array
    {
        $conn_state = $this->conn_cache->fetch($connection->id);
        if ($conn_state === null) {
            throw new CacheNotFoundException();
        }
        if ($conn_state->session_id !== $session_id) {
            throw new CacheNotFoundException();// セッション成りすましを防止
        }
        $room_states = $this->room_cache->fetchValues();
        return $room_states;
    }

    public function create(TcpConnection $connection, string $session_id, string $name): RoomState
    {
        $conn_state = $this->conn_cache->fetch($connection->id);
        if ($conn_state === null) {
            throw new CacheNotFoundException('Connection not found');
        }
        if ($conn_state->session_id !== $session_id) {
            throw new CacheNotFoundException('Invalid session');// セッション成りすましを防止
        }
        if ($conn_state->isJoinedRoom()) {
            throw new CacheNotFoundException('User has already joined');// 他ルームに参加しているのに作成はできない
        }
        $user = $this->user_repo->fetchFirstById($conn_state->user_id);
        if ($user === null) {
            throw new CacheNotFoundException('User does not found');
        }
        $code = self::generateCode();
        if ($this->room_cache->has($code)) {
            throw new CacheNotFoundException('Duplicate room code');// 他ルームとコード被ったのでエラー
        }
        // $this->room_repo->insert([
        //     'name' => $name,
        //     'code'=> $code,
        //     'user_id_1' => $conn_state->user_id,
        // ]);
        $room_state = $this->room_cache->insert($code, $name, new UserState($conn_state->user_id, $user->name, $connection->id));
        $conn_state->setRoomCode($code);
        return $room_state;
    }

    public function join(TcpConnection $connection, string $session_id, string $code): RoomState
    {
        $conn_state = $this->conn_cache->fetch($connection->id);
        if ($conn_state === null) {
            throw new CacheNotFoundException('Connection not found');
        }
        if ($conn_state->session_id !== $session_id) {
            throw new CacheNotFoundException('Invalid session');// セッション成りすましを防止
        }
        if ($conn_state->isJoinedRoom()) {
            throw new CacheNotFoundException('User has already joined');// 他ルームに参加しているのに参加はできない
        }
        $room_state = $this->room_cache->fetch($code);
        if ($room_state === null) {
            throw new CacheNotFoundException('Room not found');// ルームが見つからない場合はNG
        }
        $user = $this->user_repo->fetchFirstById($conn_state->user_id);
        if ($user === null) {
            throw new CacheNotFoundException('User does not found');
        }
        $room_state->setUser2(new UserState($conn_state->user_id, $user->name, $connection->id));
        $conn_state->setRoomCode($code);
        return $room_state;
    }

    /**
     * @param TcpConnection $connection
     * @param string $session_id
     * @throws CacheNotFoundException
     * @return RoomLeaveResult[]
     */
    public function leave(TcpConnection $connection, string $session_id): array
    {
        $conn_state = $this->conn_cache->fetch($connection->id);
        if ($conn_state === null) {
            throw new CacheNotFoundException('Connection not found');
        }
        if ($conn_state->session_id !== $session_id) {
            throw new CacheNotFoundException('Invalid session');
        }
        if (!$conn_state->isJoinedRoom()) {
            throw new CacheNotFoundException('User not joined');// 他ルームに参加していないのに退出できない
        }
        $room_code = $conn_state->getRoomCode();
        $room_state = $this->room_cache->fetch($room_code);
        if ($room_state === null) {
            throw new CacheNotFoundException('Room not found:' . $room_code);// ルーム見つからなかった
        }

        $connection_ids = $room_state->getConnectionIds();
        $room_state->deleteUser($conn_state->user_id);// ルームからユーザーを消す
        if (!$room_state->hasUser1()) {// ルームオーナーがいないなら
            $this->room_cache->delete($room_code);// ルーム消す
        }
        $results = [];
        foreach ($connection_ids as $connection_id) {
            $cs = $this->conn_cache->fetch($connection_id);
            if ($cs !== null) {
                $leave = $cs->user_id === $conn_state->user_id || !$room_state->hasUser1();
                if ($leave) {
                    $cs->clearRoomCode();// 接続のルームを消す
                }
                $results[] = new RoomLeaveResult($cs->connection, $room_state, $leave);
            }
        }
        return $results;
    }

    /**
     * @param TcpConnection $connection
     * @return RoomLeaveResult[]
     */
    public function forceLeave(TcpConnection $connection): array
    {
        $conn_state = $this->conn_cache->fetch($connection->id);
        if ($conn_state === null) {
            echo "Connection not found" . PHP_EOL;
            return [];
        }
        if (!$conn_state->isJoinedRoom()) {
            echo "Room not joined" . PHP_EOL;
            return [];
        }
        $room_code = $conn_state->getRoomCode();
        $room_state = $this->room_cache->fetch($room_code);
        if ($room_state === null) {
            echo "Room not found" . PHP_EOL;
            return [];
        }

        $conn_state->clearRoomCode();// 接続のルームを消す
        $connection_ids = $room_state->getConnectionIds();
        $room_state->deleteUser($conn_state->user_id);// ルームからユーザーを消す
        if (!$room_state->hasUser1()) {// ルームオーナーがいないなら
            $this->room_cache->delete($room_code);// ルーム消す
        }
        $results = [];
        foreach ($connection_ids as $connection_id) {
            if ($connection_id !== $connection->id) {
                $cs = $this->conn_cache->fetch($connection_id);
                if ($cs !== null) {
                    $leave = !$room_state->hasUser1();
                    if ($leave) {
                        $cs->clearRoomCode();// 接続のルームを消す
                    }
                    $results[] = new RoomLeaveResult($cs->connection, $room_state, $leave);
                }
            }
        }
        return $results;
    }

    public static function generateCode(): string
    {
        $ramdom = new \Random\Randomizer();
        $result = $ramdom->getBytesFromString("0123456789", 6);
        return $result;
    }
}