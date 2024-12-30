import { Database } from 'duckdb-async';
import { DuckDbAsyncDialect } from '../src';
import { Kysely } from 'kysely';

export async function createDatabase<T>() {
  const database = await Database.create(':memory:');

  const dialect = new DuckDbAsyncDialect({
    database,
  });

  const kysely = new Kysely<T>({ dialect });

  return kysely;
}