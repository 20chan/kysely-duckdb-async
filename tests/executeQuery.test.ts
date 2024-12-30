import { CompiledQuery } from 'kysely';
import { expect } from 'expect';
import { createDatabase } from './common';

describe('executeQuery', () => {
  it('select 1', async () => {
    const db = await createDatabase();

    const result = await db.executeQuery(CompiledQuery.raw('SELECT 1'));

    expect(result.rows).toEqual([{ 1: 1 }]);
  });

  it('create table', async () => {
    const db = await createDatabase();

    await db.executeQuery(CompiledQuery.raw('CREATE TABLE test (id INT)'));
  });

  it('insert', async () => {
    const db = await createDatabase();

    await db.executeQuery(CompiledQuery.raw('CREATE TABLE test (id INT)'));
    await db.executeQuery(CompiledQuery.raw('INSERT INTO test (id) VALUES (1)'));
    const result = await db.executeQuery(CompiledQuery.raw('SELECT * FROM test'));

    expect(result.rows).toEqual([{ id: 1 }]);
  });
});
