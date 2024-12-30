# kysely-duckdb-async

kysely dialect for DuckDB, with async duckdb bindings

If you are looking for a synchronous version, check out [kysely-duckdb](https://github.com/runoshun/kysely-duckdb)

## Usage

```typescript
import { Database } from 'duckdb-async';
import { Kysely } from 'kysely';
import { DuckDbAsyncDialect } from 'kysely-duckdb-async';

const database = await Database.create(':memory:');
const dialect = new DuckDbAsyncDialect({ database });
const kysely = new Kysely<DatabaseSchema>({ dialect });

// result = [{ id: 1, name: 'John Doe' }]
const result = await kysely
  .select('id', 'name')
  .from('users')
  .where('id', '=', 1)
  .execute();
```

## Type supports for DuckDB datatypes

> TODO

Supports array, map, and struct types.

```typescript
interface Test {
  id: number;
  arr: [number, number, number];
  map: Map<string, number>;
  struct: { a: number; b: number };
}

await db.insertInto('test')
  .values({
    id: 1,
    arr: new ListValue([1, 2, 3]),
    map: new MapValue(new Map([['a', 1], ['b', 2]])),
    struct: new StructValue({ a: 1, b: 2 }),
  })
  .execute();
```