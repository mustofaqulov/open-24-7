package main

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

func main() {
	if err := run(); err != nil {
		fmt.Fprintln(os.Stderr, "migration failed:", err)
		os.Exit(1)
	}
}

func run() error {
	url := os.Getenv("DATABASE_URL")
	if url == "" {
		return fmt.Errorf("DATABASE_URL is required")
	}
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Minute)
	defer cancel()
	pool, err := pgxpool.New(ctx, url)
	if err != nil {
		return fmt.Errorf("connect: %w", err)
	}
	defer pool.Close()
	conn, err := pool.Acquire(ctx)
	if err != nil {
		return fmt.Errorf("acquire database connection: %w", err)
	}
	defer conn.Release()
	if _, err := conn.Exec(ctx, `SELECT pg_advisory_lock(hashtext('open24_go_migrations'))`); err != nil {
		return fmt.Errorf("lock migrations: %w", err)
	}
	defer func() { _, _ = conn.Exec(context.Background(), `SELECT pg_advisory_unlock(hashtext('open24_go_migrations'))`) }()
	var schemaExists bool
	if err := conn.QueryRow(ctx, `SELECT to_regclass('categories') IS NOT NULL`).Scan(&schemaExists); err != nil {
		return fmt.Errorf("inspect schema: %w", err)
	}
	var historyExists bool
	if err := conn.QueryRow(ctx, `SELECT to_regclass('open24_go_migrations') IS NOT NULL`).Scan(&historyExists); err != nil {
		return fmt.Errorf("inspect migration history: %w", err)
	}
	if schemaExists && !historyExists {
		return fmt.Errorf("existing database has no Go migration history; baseline it explicitly before using this command")
	}
	if _, err := conn.Exec(ctx, `CREATE TABLE IF NOT EXISTS open24_go_migrations (
		name text PRIMARY KEY, checksum text NOT NULL, applied_at timestamptz NOT NULL DEFAULT now())`); err != nil {
		return fmt.Errorf("create migration history: %w", err)
	}
	files, err := filepath.Glob(filepath.Join("prisma", "migrations", "*", "migration.sql"))
	if err != nil || len(files) == 0 {
		return fmt.Errorf("migration SQL files unavailable: %w", err)
	}
	sort.Strings(files)
	for _, path := range files {
		name := filepath.Base(filepath.Dir(path))
		contents, err := os.ReadFile(path)
		if err != nil {
			return fmt.Errorf("read %s: %w", name, err)
		}
		hash := sha256.Sum256(contents)
		checksum := hex.EncodeToString(hash[:])
		var existing string
		err = conn.QueryRow(ctx, `SELECT checksum FROM open24_go_migrations WHERE name=$1`, name).Scan(&existing)
		if err == nil {
			if existing != checksum {
				return fmt.Errorf("migration %s changed after application", name)
			}
			continue
		}
		if !errors.Is(err, pgx.ErrNoRows) {
			return fmt.Errorf("read history for %s: %w", name, err)
		}
		tx, err := conn.Begin(ctx)
		if err != nil {
			return fmt.Errorf("begin %s: %w", name, err)
		}
		if _, err := tx.Exec(ctx, string(contents), pgx.QueryExecModeSimpleProtocol); err != nil {
			_ = tx.Rollback(ctx)
			return fmt.Errorf("apply %s: %w", name, err)
		}
		if _, err := tx.Exec(ctx, `INSERT INTO open24_go_migrations(name,checksum) VALUES($1,$2)`, name, checksum); err != nil {
			_ = tx.Rollback(ctx)
			return fmt.Errorf("record %s: %w", name, err)
		}
		if err := tx.Commit(ctx); err != nil {
			return fmt.Errorf("commit %s: %w", name, err)
		}
		fmt.Println("applied", name)
	}
	return nil
}
