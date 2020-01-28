const academyBenefitsSearchGateway = require('../../../lib/gateways/Academy-Benefits/AcademyBenefitsSearchGateway');

describe('AcademyBenefitsSearchGateway', () => {
  let buildSearchRecord;
  let db;

  const createGateway = records => {
    buildSearchRecord = jest.fn(({ id }) => {
      return { id };
    });

    db = {
      request: jest.fn(async () => records)
    };

    return academyBenefitsSearchGateway({
      buildSearchRecord,
      db
    });
  };

  it('if the query contains firstname then the db is queried for forename', async () => {
    const gateway = createGateway([]);
    const firstName = 'maria';
    const queryMatcher = expect.stringMatching(/forename LIKE @forename/);
    const paramMatcher = expect.arrayContaining([
      expect.objectContaining({ value: `%${firstName.toUpperCase()}%` })
    ]);

    await gateway.execute({ firstName });

    expect(db.request).toHaveBeenCalledWith(queryMatcher, paramMatcher);
  });

  it('if the query does not have a firstname then the db is not queried for the forename', async () => {
    const gateway = createGateway([]);
    const queryMatcher = expect.not.stringMatching(/forename LIKE @forename/);

    await gateway.execute({});

    expect(db.request).toHaveBeenCalledWith(queryMatcher, expect.anything());
  });

  it('if the query contains lastname then the db is queried for lastname', async () => {
    const gateway = createGateway([]);
    const lastName = 'smith';
    queryMatcher = expect.stringMatching(/surname LIKE/);
    const paramMatcher = expect.arrayContaining([
      expect.objectContaining({ value: `%${lastName.toUpperCase()}%` })
    ]);

    await gateway.execute({ lastName });

    expect(db.request).toHaveBeenCalledWith(queryMatcher, paramMatcher);
  });

  it('if the query does not have a lastname then the db is not queried for the lastname', async () => {
    const gateway = createGateway([]);
    const queryMatcher = expect.not.stringMatching(/surname LIKE @surname/);

    await gateway.execute({});

    expect(db.request).toHaveBeenCalledWith(queryMatcher, expect.anything());
  });

  it('returns record if all id components exist', async () => {
    const record = { claim_id: '123', check_digit: 'd', person_ref: '1' };
    const gateway = createGateway([record]);

    const records = await gateway.execute({});

    expect(buildSearchRecord).toHaveBeenCalledTimes(1);
    expect(records.length).toBe(1);
    expect(records[0].id).toBe('123d/1');
  });

  it("doesn't return a record if any of the id components are missing", async () => {
    const record = { claim_id: '123', check_digit: 'd' };
    const gateway = createGateway([record]);

    const records = await gateway.execute({});

    expect(buildSearchRecord).toHaveBeenCalledTimes(0);
    expect(records.length).toBe(0);
  });
});