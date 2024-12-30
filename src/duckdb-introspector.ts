import { DatabaseIntrospector, DatabaseMetadata, DatabaseMetadataOptions, DEFAULT_MIGRATION_LOCK_TABLE, DEFAULT_MIGRATION_TABLE, Kysely, SchemaMetadata, sql, TableMetadata } from 'kysely';

export class DuckDbIntrospector implements DatabaseIntrospector {
  constructor(
    private readonly db: Kysely<any>,
  ) {}

  async getSchemas(): Promise<SchemaMetadata[]> {
    const rawSchemas = await this.db
      .selectFrom('information_schema.schemata')
      .select('SCHEMA_NAME')
      .$castTo<{ SCHEMA_NAME: string }>()
      .execute();

    return rawSchemas.map(row => ({ name: row.SCHEMA_NAME }));
  }

  async getTables(options?: DatabaseMetadataOptions): Promise<TableMetadata[]> {
    const withInternalKyselyTables = options?.withInternalKyselyTables ?? false;

    let rawTables = await this.db
      .selectFrom('information_schema.tables')
      .select(['TABLE_NAME', 'TABLE_TYPE', 'TABLE_SCHEMA'])
      .where('TABLE_SCHEMA', '=', sql`current_schema()`)
      .orderBy('TABLE_NAME')
      .$castTo<RawTableMetadata>()
      .execute();

    let rawColumns = await this.db
      .selectFrom('information_schema.columns')
      .select([
        'COLUMN_NAME',
        'COLUMN_DEFAULT',
        'TABLE_NAME',
        'TABLE_SCHEMA',
        'IS_NULLABLE',
        'DATA_TYPE',
      ])
      .where('TABLE_SCHEMA', '=', sql`current_schema()`)
      .orderBy('TABLE_NAME')
      .orderBy('ORDINAL_POSITION')
      .$castTo<RawColumnMetadata>()
      .execute();

    if (!withInternalKyselyTables) {
      rawTables = rawTables.filter(table => (
        table.TABLE_NAME !== DEFAULT_MIGRATION_TABLE
        && table.TABLE_NAME !== DEFAULT_MIGRATION_LOCK_TABLE
      ));

      rawColumns = rawColumns.filter(column => (
        column.TABLE_NAME !== DEFAULT_MIGRATION_TABLE
        && column.TABLE_NAME !== DEFAULT_MIGRATION_LOCK_TABLE
      ));
    }

    return this.#parseTableMetadata(rawTables, rawColumns);
  }

  async getMetadata(options?: DatabaseMetadataOptions): Promise<DatabaseMetadata> {
    return {
      tables: await this.getTables(options),
    }
  }

  #parseTableMetadata(rawTables: RawTableMetadata[], rawColumns: RawColumnMetadata[]): TableMetadata[] {
    const tables = new Map<string, TableMetadata>();

    for (const table of rawTables) {
      tables.set(table.TABLE_NAME, {
        name: table.TABLE_NAME,
        isView: table.TABLE_TYPE === 'VIEW',
        schema: table.TABLE_SCHEMA,
        columns: [],
      });
    }

    for (const column of rawColumns) {
      const { TABLE_NAME } = column;

      if (!tables.has(TABLE_NAME)) {
        throw new Error(`Table "${column.TABLE_NAME}" not found for column "${column.COLUMN_NAME}"`);
      }

      const table = tables.get(TABLE_NAME)!;
      table.columns.push({
        name: column.COLUMN_NAME,
        dataType: column.DATA_TYPE,
        isAutoIncrementing: false,
        isNullable: column.IS_NULLABLE === 'YES',
        hasDefaultValue: column.COLUMN_DEFAULT !== null,
      });

      tables.set(TABLE_NAME, table);
    }

    return [...tables.values()];
  }
}

interface RawTableMetadata {
  TABLE_NAME: string;
  TABLE_TYPE: string;
  TABLE_SCHEMA: string;
}

interface RawColumnMetadata {
  COLUMN_NAME: string;
  COLUMN_DEFAULT: any;
  TABLE_NAME: string;
  TABLE_SCHEMA: string;
  IS_NULLABLE: "YES" | "NO";
  DATA_TYPE: string;
}