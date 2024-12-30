import { expect } from 'expect';
import { createDatabase } from './common';

describe('select', () => {
  it('selectNoFrom', async () => {
    const db = await createDatabase();

    const resp = await db.selectFrom(x => db.selectNoFrom([
      x.lit(1).as('one'),
      x.fn('NOW').as('now'),
    ]).as('t'))
      .select('t.one as two')
      .select('t.now as time')
      .execute();

    expect(resp).toHaveLength(1);
    expect(resp[0].two).toBe(1);
    expect(resp[0].time).toBeInstanceOf(Date);
  });
});
