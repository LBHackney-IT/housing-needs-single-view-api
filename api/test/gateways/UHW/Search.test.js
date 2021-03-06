const UHWSearch = require('../../../lib/gateways/UHW/Search');

describe('UHWSearchGateway', () => {
  let buildSearchRecord;
  let db;
  let logger;
  const dbError = new Error('Database error');

  const createGateway = (records, throwsError) => {
    buildSearchRecord = jest.fn(({ id }) => {
      return { id };
    });

    db = {
      request: jest.fn(async () => {
        if (throwsError) {
          throw dbError;
        }
        return records;
      })
    };

    logger = {
      error: jest.fn((msg, err) => {})
    };

    return UHWSearch({
      buildSearchRecord,
      db,
      logger
    });
  };

  it('queries the db for forename if the query contains firstname', async () => {
    const gateway = createGateway([]);
    const firstName = 'maria';
    const queryMatcher = expect.stringMatching(/LIKE @forename/);
    const paramMatcher = expect.arrayContaining([
      expect.objectContaining({ value: `%${firstName.toLowerCase()}%` })
    ]);

    await gateway.execute({ firstName });

    expect(db.request).toHaveBeenCalledWith(queryMatcher, paramMatcher);
  });

  it('does not query the db for forename if the query does not contain firstname', async () => {
    const gateway = createGateway([]);
    const queryMatcher = expect.not.stringMatching(/LIKE @forename/);

    await gateway.execute({});

    expect(db.request).toHaveBeenCalledWith(queryMatcher, expect.anything());
  });

  it('queries the db for surname if the query contains lastname', async () => {
    const gateway = createGateway([]);
    const lastName = 'smith';
    queryMatcher = expect.stringMatching(/LIKE @surname/);
    const paramMatcher = expect.arrayContaining([
      expect.objectContaining({ value: `%${lastName.toLowerCase()}%` })
    ]);

    await gateway.execute({ lastName });

    expect(db.request).toHaveBeenCalledWith(queryMatcher, paramMatcher);
  });

  it('does not query the db for surname if the query does not contain lastname', async () => {
    const gateway = createGateway([]);
    const queryMatcher = expect.not.stringMatching(/LIKE @surname/);

    await gateway.execute({});

    expect(db.request).toHaveBeenCalledWith(queryMatcher, expect.anything());
  });

  it('builds a record', async () => {
    const record = { ContactNo: 1231 };
    const gateway = createGateway([record]);

    const records = await gateway.execute({});

    expect(buildSearchRecord).toHaveBeenCalledTimes(1);
    expect(records.length).toBe(1);
  });

  it('returns an empty set of records if there is an error and calls logger', async () => {
    const record = { ContactNo: 1231 };
    const gateway = createGateway([record], true);

    const records = await gateway.execute({});

    expect(records.length).toBe(0);
    expect(logger.error).toHaveBeenCalledWith(
      'Error searching customers in UHW: Error: Database error',
      dbError
    );
  });
});
