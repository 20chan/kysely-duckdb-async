import type { Connection, Database } from 'duckdb-async';

export interface DuckDbDialectConfig {
  database: DuckDbDatabase;
  onCreateConnection?: (connection: Connection) => Promise<void>;
}

export type DuckDbDatabase = Database | (() => Promise<Database>);