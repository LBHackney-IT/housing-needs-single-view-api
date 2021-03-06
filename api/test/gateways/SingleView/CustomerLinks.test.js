const CustomerLinks = require('../../../lib/gateways/SingleView/CustomerLinks');

describe('CustomerLinks', () => {
  let db;
  let logger;
  const dbError = new Error('Database error');

  const createGateway = (records, throwsError) => {
    db = {
      any: jest.fn(async () => {
        if (throwsError) {
          throw dbError;
        }
        return records;
      })
    };

    logger = {
      error: jest.fn((msg, err) => {})
    };

    return CustomerLinks({
      db,
      logger
    });
  };

  it('gets the customer links from singleview id', async () => {
    const gateway = createGateway([]);
    const name = 'JIGSAW';
    const paramMatcher = expect.arrayContaining([name]);

    await gateway.execute(name);

    expect(db.any).toHaveBeenCalledWith(expect.anything(), paramMatcher);
  });

  it('Catches an error if it is thrown and calls the logger', async () => {
    const gateway = createGateway([], true);

    expect(await gateway.execute()).toBeUndefined();
    expect(logger.error).toHaveBeenCalledWith(
      'Could fetch customer links because of an error: Error: Database error',
      dbError
    );
  });
});
