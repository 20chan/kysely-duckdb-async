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