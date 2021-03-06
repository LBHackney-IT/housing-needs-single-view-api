const FetchAreaPatch = require('../../../lib/gateways/MaT-Service-API/FetchAreaPatch');
const nock = require('nock');

describe('MaT-Service-API FetchAreaPatch gateway', () => {
  const uprn = '12345678901';
  const data = {
    patch: {
      patchCode: 'some patch code',
      areaName: 'some area',
      ward: 'some ward',
      officerFullName: 'officer name'
    }
  };

  const createGateway = (response, uprn) => {
    const baseUrl = 'https://test-domain.com';
    const apiToken = 'anbdabkd';

    nock(baseUrl, {
      reqheaders: {
        Cookie: `hackneyToken=${apiToken};`
      }
    })
      .get(`/api/properties/${uprn}/patch`)
      .reply(200, response);

    return FetchAreaPatch({
      baseUrl,
      apiToken
    });
  };

  it('queries the API with appropriate parameters', async () => {
    const gateway = createGateway(data, uprn);
    await gateway.execute(uprn);
    expect(nock.isDone()).toBe(true);
  });

  it('returns the data from the API', async () => {
    const gateway = createGateway(data, uprn);

    const response = await gateway.execute(uprn);
    expect(response).toEqual(data);
  });
});
