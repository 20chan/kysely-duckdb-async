import type { Connection, TableData } from 'duckdb-async';
import type { CompiledQuery, DatabaseConnection, QueryResult } from 'kysely';

export class DuckDbConnection implements DatabaseConnection {
  constructor(
    private readonly conn: Connection,
  ) { }

  async executeQuery<R>(compiledQuery: CompiledQuery): Promise<QueryResult<R>> {
    const { sql, parameters } = compiledQuery;
    const stmt = await this.conn.prepare(sql);

    const table = await stmt.all(...parameters);
    return this.formatTable(table, sql);
  }

  async *streamQuery<R>(compiledQuery: CompiledQuery, chunkSize?: number): AsyncIterableIterator<QueryResult<R>> {
    const { sql, parameters } = compiledQuery;
    const iter = this.conn.stream(sql, ...parameters);

    let isSelect: boolean | undefined = undefined;

    for await (const row of iter) {
      if (isSelect === undefined) {
        isSelect = this.isReader([row], sql);
      }

      yield this.formatTable([row], sql, isSelect);
    }
  }

  private isReader(table: TableData, sql: string): boolean {
    if (table.length === 0) {
      return sql.toLocaleLowerCase().includes('select');
    }

    const isInsertedRows = Object.keys(table[0]).length === 1
      && Object.keys(table[0])[0].toLocaleLowerCase() === 'Count'
      && table.length === 1;

    return !isInsertedRows;
  }

  private formatTable<T>(table: TableData, sql: string, isReader?: boolean): QueryResult<T> {
    if (isReader === undefined) {
      isReader = this.isReader(table, sql);
    }

    if (isReader) {
      return { rows: table as T[] };
    }

    const row = table[0];
    const numAffectedRows = !row ? undefined : BigInt(row['Count']);

    return {
      numAffectedRows,
      insertId: undefined,
      rows: [],
    };
  }

  async release(): Promise<void> {
    await this.conn.close();
  }
}