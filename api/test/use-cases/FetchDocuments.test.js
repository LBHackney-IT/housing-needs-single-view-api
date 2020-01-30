describe('FetchDocuments', () => {
  const docsFromA = [
    { id: 1, date: new Date(2010, 5, 12) },
    { id: 2, date: new Date(2012, 8, 4) }
  ];
  const docsFromB = [{ id: 5, date: new Date(2014, 2, 2) }];

  let gateways;
  let fetchDocuments;

  beforeEach(() => {
    gateways = [
      {
        execute: jest.fn(() => docsFromA)
      },
      {
        execute: jest.fn(() => docsFromB)
      }
    ];
    fetchDocuments = require('../../lib/use-cases/FetchDocuments')({
      gateways
    });
  });

  it('can query for a customers documents from multiple gateways', async () => {
    const id = 1;

    await fetchDocuments(id);

    gateways.forEach(gateway => {
      expect(gateway.execute).toHaveBeenCalledWith(id);
    });
  });

  it('concatenates the results', async () => {
    const expectedDocuments = { documents: [].concat(docsFromA, docsFromB) };

    const documents = await fetchDocuments();

    expect(documents).toEqual(expect.objectContaining(expectedDocuments));
    expect(documents.length).toEqual(expectedDocuments.length);
  });

  it('can sort the documents by date descending', async () => {
    const expectedDocuments = {
      documents: [].concat(docsFromA, docsFromB).sort((a, b) => b.date - a.date)
    };

    const documents = await fetchDocuments();

    expect(documents).toEqual(expect.objectContaining(expectedDocuments));
  });
});
