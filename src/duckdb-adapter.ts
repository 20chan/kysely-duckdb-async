import { DialectAdapterBase, Kysely, MigrationLockOptions } from 'kysely';

export class DuckDbAdapter extends DialectAdapterBase {
  get supportsTransactionalDdl(): boolean {
    return false;
  }

  get supportsReturning(): boolean {
    return true;
  }

  async acquireMigrationLock(db: Kysely<any>, options: MigrationLockOptions): Promise<void> {
  }

  async releaseMigrationLock(db: Kysely<any>, options: MigrationLockOptions): Promise<void> {
  }
}