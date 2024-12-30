import type { Database } from 'duckdb-async';
import { CompiledQuery, DatabaseConnection, Driver, TransactionSettings } from 'kysely';
import type { DuckDbDialectConfig } from './duckdb-dialect-config';
import { DuckDbConnection } from './duckdb-connection';

export class DuckDbDriver implements Driver {
  #db?: Database;

  constructor(
    private readonly config: DuckDbDialectConfig,
  ) { }

  async init(): Promise<void> {
    const { database } = this.config;

    this.#db = (typeof database === 'function'
      ? await database()
      : database
    );
  }

  async acquireConnection(): Promise<DatabaseConnection> {
    if (!this.#db) {
      throw new Error('Driver not initialized');
    }

    const conn = await this.#db.connect();
    if (this.config.onCreateConnection) {
      await this.config.onCreateConnection(conn);
    }

    return new DuckDbConnection(conn);
  }

  async beginTransaction(connection: DatabaseConnection, settings: TransactionSettings): Promise<void> {
    await connection.executeQuery(CompiledQuery.raw('BEGIN TRANSACTION'));
  }

  async commitTransaction(connection: DatabaseConnection): Promise<void> {
    await connection.executeQuery(CompiledQuery.raw('COMMIT'));
  }

  async rollbackTransaction(connection: DatabaseConnection): Promise<void> {
    await connection.executeQuery(CompiledQuery.raw('ROLLBACK'));
  }

  async releaseConnection(connection: DatabaseConnection): Promise<void> {
    await (connection as DuckDbConnection).release();
  }

  async destroy(): Promise<void> {
    if (this.#db) {
      await this.#db.close();
    }
  }
}