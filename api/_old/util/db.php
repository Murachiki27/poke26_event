<?php
declare(strict_types=1);

class Db {
    private PDO $pdo;

    public function __construct(string $database, string $username, string $password) {
        $this->pdo = new PDO("mysql:host=db;dbname=$database;charset=utf8", $username, $password, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
        ]);
    }

    public function fetchAll(string $query, array $bind = []): array {
        $stmt = $this->pdo->prepare($query);
        foreach ($bind as $key => $value) {
            $paramKey = is_int($key) ? $key + 1 : $key;
            // 型の判定
            if (is_int($value)) {
                $stmt->bindValue($paramKey, $value, \PDO::PARAM_INT);
            } elseif (is_bool($value)) {
                $stmt->bindValue($paramKey, $value, \PDO::PARAM_BOOL);
            } elseif (is_null($value)) {
                $stmt->bindValue($paramKey, $value, \PDO::PARAM_NULL);
            } else {
                $stmt->bindValue($paramKey, $value, \PDO::PARAM_STR);
            }
        }
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function insert(string $query, array $bind = []): int|string {
        $stmt = $this->pdo->prepare($query);
        foreach ($bind as $key => $value) {
            $paramKey = is_int($key) ? $key + 1 : $key;
            // 型の判定
            if (is_int($value)) {
                $stmt->bindValue($paramKey, $value, \PDO::PARAM_INT);
            } elseif (is_bool($value)) {
                $stmt->bindValue($paramKey, $value, \PDO::PARAM_BOOL);
            } elseif (is_null($value)) {
                $stmt->bindValue($paramKey, $value, \PDO::PARAM_NULL);
            } else {
                $stmt->bindValue($paramKey, $value, \PDO::PARAM_STR);
            }
        }
        $stmt->execute();
        $lastId = $this->pdo->lastInsertId();
        return $lastId !== '0' ? $lastId : $stmt->rowCount();
    }
}

class MySql {
    private static ?Db $poke26 = null;

    public static function poke26(): Db {
        if (!self::$poke26) {
            self::$poke26 = new Db('poke26', 'pikachu', 'pikachu2026');
        }
        return self::$poke26;
    }
}

