const UHTContactsSearchGateway = require('../../../lib/gateways/UHT-Contacts/UHTContactsSearchGateway');


describe('UHTContactsSearchGateway', () => {
  let buildSearchRecord;
  let db;

  const createGateway = (records, throwsError) => {
    buildSearchRecord = jest.fn(({ id }) => {
      return { id };
    });

    db = {
      request: jest.fn(async () => {
        if (throwsError) {
          return new Error("Database error")
        }
        return records;
      })
    };

    return UHTContactsSearchGateway({
      buildSearchRecord,
      db
    });
  };

  it('if the query contains firstname then the db is queried for forename', async () => {
    const gateway = createGateway([]);
    const firstName = 'maria';
    const queryMatcher = expect.stringMatching(/LIKE @forename/);
    const paramMatcher = expect.arrayContaining([
      expect.objectContaining({ value: `%${firstName.toUpperCase()}%` })
    ]);

    await gateway.execute({ firstName });

    expect(db.request).toHaveBeenCalledWith(queryMatcher, paramMatcher);
  });

  it('if the query does not have a firstname then the db is not queried for the forename', async () => {
    const gateway = createGateway([]);
    const queryMatcher = expect.not.stringMatching(/LIKE @forename/);

    await gateway.execute({});

    expect(db.request).toHaveBeenCalledWith(queryMatcher, expect.anything());
  });

  it('if the query contains surname then the db is queried for surname', async () => {
    const gateway = createGateway([]);
    const lastName = 'smith';
    const queryMatcher = expect.stringMatching(/LIKE @surname/);
    const paramMatcher = expect.arrayContaining([
      expect.objectContaining({ value: `%${lastName.toUpperCase()}%` })
    ]);

    await gateway.execute({ lastName });

    expect(db.request).toHaveBeenCalledWith(queryMatcher, paramMatcher);
  });

  it('if the query does not have a lastname then the db is not queried for the surname', async () => {
    const gateway = createGateway([]);
    const queryMatcher = expect.not.stringMatching(/LIKE @surname/);

    await gateway.execute({});

    expect(db.request).toHaveBeenCalledWith(queryMatcher, expect.anything());
  });

  it('returns record if all id components exist', async () => {
    const record = { house_ref: '123 ', person_no: 'd' };
    const gateway = createGateway([record]);

    const records = await gateway.execute({});

    expect(buildSearchRecord).toHaveBeenCalledTimes(1);
    expect(records.length).toBe(1);
    expect(records[0].id).toBe('123/d');
  });

  it("doesn't return a record if any of the id components are missing", async () => {
    const record = { house_ref: '123 ' };
    const gateway = createGateway([record]);

    const records = await gateway.execute({});

    expect(buildSearchRecord).toHaveBeenCalledTimes(0);
    expect(records.length).toBe(0);
  });

  it("returns empty records if the db connection experiences an error", async () => {
    const record = { account_ref: '123', account_cd: '1' };
    const gateway = createGateway([record], true);

    const records = await gateway.execute({});

    expect(records.length).toBe(0);
  });
});