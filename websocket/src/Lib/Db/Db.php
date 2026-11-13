<?php
declare(strict_types=1);

namespace Poke26\App\Lib\Db;

use PDO;
use PDOStatement;

class Db
{
    private PDO $pdo;

    public function __construct(string $dsn, string $username, string $password)
    {
        $this->pdo = new PDO($dsn, $username, $password, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
        ]);
    }

    public function readQuery(string $query, array $bind = []): array
    {
        $stmt = $this->pdo->prepare($query);
        self::bindValues($stmt, $bind);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function writeQuery(string $query, array $bind = []): int|string
    {
        $stmt = $this->pdo->prepare($query);
        self::bindValues($stmt, $bind);
        $stmt->execute();
        $lastId = $this->pdo->lastInsertId();
        return $lastId !== '0' ? $lastId : $stmt->rowCount();
    }

    private static function bindValues(PDOStatement $stmt, array $bind): void
    {
        foreach ($bind as $key => $value) {
            $paramKey = is_int($key) ? $key + 1 : $key;
            // 型の判定
            if (is_int($value)) {
                $stmt->bindValue($paramKey, $value, PDO::PARAM_INT);
            } elseif (is_bool($value)) {
                $stmt->bindValue($paramKey, $value, PDO::PARAM_BOOL);
            } elseif (is_null($value)) {
                $stmt->bindValue($paramKey, $value, PDO::PARAM_NULL);
            } else {
                $stmt->bindValue($paramKey, $value, PDO::PARAM_STR);
            }
        }
    }
}
