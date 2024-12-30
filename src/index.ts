import type {
  DatabaseIntrospector,
  Dialect,
  DialectAdapter,
  Driver,
  Kysely,
  QueryCompiler,
} from 'kysely';
import type { DuckDbDialectConfig } from './duckdb-dialect-config';
import { DuckDbDriver } from './duckdb-driver';
import { DuckDbAdapter } from './duckdb-adapter';
import { DuckDbQueryCompiler } from './duckdb-query-compiler';
import { DuckDbIntrospector } from './duckdb-introspector';

export class DuckDbAsyncDialect implements Dialect {
  constructor(
    private readonly config: DuckDbDialectConfig,
  ) {}

  createAdapter(): DialectAdapter {
    return new DuckDbAdapter();
  }

  createDriver(): Driver {
    return new DuckDbDriver(this.config);
  }

  createIntrospector(db: Kysely<any>): DatabaseIntrospector {
    return new DuckDbIntrospector(db);
  }

  createQueryCompiler(): QueryCompiler {
    return new DuckDbQueryCompiler();
  }
}
