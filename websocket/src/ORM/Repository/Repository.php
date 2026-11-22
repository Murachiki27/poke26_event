<?php
declare(strict_types=1);

namespace Poke26\App\ORM\Repository;

use Poke26\App\Lib\Db\Db;

abstract class Repository
{
    protected Db $db;

    public function __construct(Db $db)
    {
        $this->db = $db;
    }

    public function fetchAll(): array
    {
        $rows = $this->db->readQuery('SELECT * FROM ' . $this->getTableName());
        return $this->castEntities($rows);
    }

    public function insert(array $data): int|string
    {
        $bind = [];
        foreach ($data as $key => $value) {
            $bind[':' . $key] = $value;
        }
        $str = implode(',', array_map(fn($key) => $key . ' = :' . $key, array_keys($data)));
        return $this->db->writeQuery('INSERT INTO ' . $this->getTableName() . ' SET ' . $str, $bind);
    }

    public function insertIgnore(array $data): int|string
    {
        $bind = [];
        foreach ($data as $key => $value) {
            $bind[':' . $key] = $value;
        }
        $str = implode(',', array_map(fn($key) => $key . ' = :' . $key, array_keys($data)));
        return $this->db->writeQuery('INSERT IGNORE INTO ' . $this->getTableName() . ' SET ' . $str, $bind);
    }

    public function affectedRows(): int
    {
        return $this->db->affectedRows();
    }

    protected function castEntity(array $row): object
    {
        $cls = $this->getEntityClass();
        return $cls::of($row);
    }

    protected function castEntities(array $rows): array
    {
        return array_map(fn($row) => $this->castEntity($row), $rows);
    }

    protected abstract function getEntityClass(): string;

    protected abstract function getTableName(): string;
}