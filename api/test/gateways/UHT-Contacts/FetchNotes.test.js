const UHTContactsFetchNotes = require('../../../lib/gateways/UHT-Contacts/FetchNotes');

describe('UHTContactsFetchNotes gateway', () => {
  let buildNote;
  let db;

  const createGateway = (notes, throwsError) => {
    buildNote = jest.fn(({ id }) => {
      return { id };
    });

    db = {
      request: jest.fn(async () => {
        if (throwsError) {
          throw new Error('Database error');
        }
        return notes;
      })
    };

    return UHTContactsFetchNotes({
      buildNote,
      db
    });
  };

  it('queries the database with appropriate id', async () => {
    const gateway = createGateway([]);
    const id = '4/1';
    const queryMatcher = expect.stringMatching(/house_ref = @house_ref/);
    const paramMatcher = expect.arrayContaining([
      {
        id: 'house_ref',
        type: 'NVarChar',
        value: '4'
      }
    ]);

    await gateway.execute(id);

    expect(db.request).toHaveBeenCalledWith(queryMatcher, paramMatcher);
  });

  it('returns nicely formatted notes', async () => {
    const id = '4/1';

    const note = {
      action_comment: 'meow',
      action_date: '20200420',
      username: 'kitty cat',
      system: 'UHT-ActionDiary'
    };

    const noteMatcher = expect.objectContaining({
      date: '2020-04-20 12:00:00',
      text: 'meow',
      title: 'Action Diary Note',
      user: 'kitty cat'
    });

    const gateway = createGateway([note]);

    const notes = await gateway.execute(id);
    expect(buildNote).toHaveBeenCalledTimes(1);
    expect(notes.length).toBe(1);
    expect(buildNote).toHaveBeenCalledWith(noteMatcher);
  });

  it('catches and console logs errors', async () => {
    let consoleOutput = '';
    const storeLog = inputs => (consoleOutput += inputs);
    console['log'] = jest.fn(storeLog);

    const gateway = createGateway(null, true);

    await gateway.execute('id');

    expect(buildNote).toHaveBeenCalledTimes(0);
    expect(consoleOutput).toBe(
      'Error fetching notes in UHT-Contacts: Error: Database error'
    );
  });

  it('returns empty array when system id is not found', async () => {
    const gateway = createGateway(null, false, true);

    const notes = await gateway.execute('id');

    expect(buildNote).toHaveBeenCalledTimes(0);
    expect(notes.length).toBe(0);
  });
});
