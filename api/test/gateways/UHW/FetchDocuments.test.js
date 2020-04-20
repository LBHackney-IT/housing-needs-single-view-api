const UHWFetchDocuments = require('../../../lib/gateways/UHW/FetchDocuments');
const buildDoc = require('../../../lib/entities/Document')();

const mockUhwDocuments = [
  {
    date: '2010-02-03T20:30:14.000Z',
    format: null,
    text: 'Housing Register form',
    title: 'Document',
    user: 'First.Last',
    system: 'UHW'
  }
];

const prepareTestGateway = (gateway, dependencies = {}) => {
  return (opts = {}) => {
    const { raiseError } = opts;

    if (raiseError) return gateway({});

    return gateway(dependencies);
  };
};

describe('UHWFetchDocumentsGateway', () => {
  const id = '123';
  const token = 'a_token';

  let buildDocument;
  let fetchW2Documents;
  let createGateway;

  beforeEach(() => {
    buildDocument = jest.fn(doc => buildDoc(doc));
    fetchW2Documents = jest.fn(() => mockUhwDocuments);

    createGateway = prepareTestGateway(UHWFetchDocuments, {
      buildDocument,
      fetchW2Documents
    });
  });

  it('gets and processes the docs if customer has a system id', async () => {
    const gateway = createGateway();

    const expectedFetchParam = [{ gateway: 'uhw', id: '123' }, 'a_token'];

    const expectedBuildParam = expect.objectContaining(mockUhwDocuments[0]);

    const expectedDocument = expect.objectContaining({
      ...mockUhwDocuments[0],
      date: '2010-02-03 08:30:14'
    });

    const documents = await gateway.execute(id, token);

    expect(fetchW2Documents).toHaveBeenCalledWith(...expectedFetchParam);
    expect(buildDocument).toHaveBeenCalledWith(expectedBuildParam);
    expect(documents.length).toEqual(1);
    expect(documents[0]).toMatchObject(expectedDocument);
  });

  it('does not get the docs if customer does not have a system id', async () => {
    const gateway = createGateway();

    const documents = await gateway.execute();

    expect(buildDocument).not.toHaveBeenCalled();
    expect(documents.length).toBe(0);
  });

  it('returns an empty set of records if there is an error', async () => {
    const gateway = createGateway({ raiseError: true });

    const documents = await gateway.execute(id, token);

    expect(buildDocument).not.toHaveBeenCalled();
    expect(documents.length).toBe(0);
  });
});
