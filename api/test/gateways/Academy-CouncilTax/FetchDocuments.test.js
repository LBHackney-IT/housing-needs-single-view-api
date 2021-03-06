const academyCouncilTaxFetchDocuments = require('../../../lib/gateways/Academy-CouncilTax/FetchDocuments');
const buildDoc = require('../../../lib/entities/Document')();

const mockCominoDocuments = [
  {
    date: '2010-02-03T20:30:14.000Z',
    format: null,
    text: 'Housing Register form',
    title: 'Document',
    user: 'First.Last',
    system: 'COMINO'
  }
];

const prepareTestGateway = (gateway, dependencies = {}) => {
  return (opts = {}) => {
    const { raiseError } = opts;

    if (raiseError) return gateway({});

    return gateway(dependencies);
  };
};

describe('AcademyCouncilTaxFetchDocumentsGateway', () => {
  const id = '123';
  const token = 'a_token';

  let buildDocument;
  let fetchW2Documents;
  let logger;
  const dbError = new Error('Database error');

  const createGateway = throwsError => {
    buildDocument = jest.fn(doc => buildDoc(doc));

    fetchW2Documents = jest.fn(() => {
      if (throwsError) {
        throw dbError;
      }
      return mockCominoDocuments;
    });

    logger = {
      error: jest.fn((msg, err) => {})
    };

    return academyCouncilTaxFetchDocuments({
      buildDocument,
      fetchW2Documents,
      logger
    });
  };

  it('requests Comino documents with the account reference if called with an id (account reference)', async () => {
    const gateway = createGateway();

    const documents = await gateway.execute(id, token);

    const expectedParams = [{ id: '123', gateway: 'hncomino' }, 'a_token'];

    const expectedDocument = expect.objectContaining({
      ...mockCominoDocuments[0],
      date: '2010-02-03 08:30:14'
    });

    expect(fetchW2Documents).toHaveBeenCalledWith(...expectedParams);
    expect(documents[0]).toMatchObject(expectedDocument);
  });

  it('does not get the docs if customer does not have an id', async () => {
    const gateway = createGateway();
    const documents = await gateway.execute(null);

    expect(fetchW2Documents).toHaveBeenCalledTimes(0);
    expect(documents.length).toBe(0);
  });

  it('returns an empty set of records if there is an error', async () => {
    const gateway = createGateway(true);
    const documents = await gateway.execute(id, token);

    expect(documents.length).toBe(0);
    expect(logger.error).toHaveBeenCalledWith(
      'Error fetching customer documents in Comino: Error: Database error',
      dbError
    );
  });
});
