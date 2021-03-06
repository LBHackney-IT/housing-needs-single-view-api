const CautionaryAlertsApi = require('../../../lib/gateways/CautionaryAlerts/CautionaryAlertsApi');
const nock = require('nock');

describe('CautionaryAlertsApiGateway', () => {
  const propertyResponse = {
    alerts: [
      {
        dateModified: '2019-06-30',
        modifiedBy: 'LSAMBA',
        startDate: '2019-03-30',
        endDate: '2020-01-13',
        alertCode: 'VA',
        description: 'Verbal abuse or threat of'
      }
    ],
    propertyReference: '000012712',
    uprn: '7498659',
    addressNumber: '345'
  };
  const peopleResponse = {
    contacts: [
      {
        tenancyAgreementReference: '1111111',
        personNumber: '23',
        contactNumber: '67',
        alerts: [
          {
            dateModified: '2019-06-30',
            modifiedBy: 'LSAMBA',
            startDate: '2019-03-30',
            endDate: '2020-01-13',
            alertCode: 'VA',
            description: 'Verbal abuse or threat of'
          }
        ]
      }
    ]
  };

  let logger = {
    error: jest.fn((msg, err) => {})
  };
  const apiToken = 'a-really-secure-token';
  const baseUrl = 'https://universal-housing.com';

  const createGateway = () => {
    return CautionaryAlertsApi({
      logger,
      baseUrl,
      apiToken
    });
  };

  describe('searchPeopleAlerts', () => {
    beforeEach(() => {
      nock(baseUrl, {
        reqheaders: {
          Authorization: `Bearer ${apiToken}`
        }
      })
        .get('/api/v1/cautionary-alerts/people')
        .query({ tag_ref: '1111111', person_number: '23' })
        .reply(200, peopleResponse);
    });

    it('calls the API endpoint with valid parameters', async () => {
      const api = createGateway();

      const apiResponse = await api.alertsForPeople('1111111', '23');
      expect(apiResponse).toEqual(peopleResponse);
      expect(nock.isDone()).toBe(true);
    });
  });

  describe('searchPeopleAlertsReturns404', () => {
    beforeEach(() => {
      nock(baseUrl, {
        reqheaders: {
          Authorization: `Bearer ${apiToken}`
        }
      })
        .get('/api/v1/cautionary-alerts/people')
        .reply(500, { contacts: [] });
    });

    it('returns an empty array if there are no query parameters', async () => {
      const api = createGateway();

      const apiResponse = await api.alertsForPeople({});
      expect(apiResponse.contacts[0].alerts.length).toBe(0);
      expect(logger.error).toHaveBeenCalledWith(
        'Error getting cautionary alerts for people: StatusCodeError: 500 - {"contacts":[]}',
        expect.anything()
      );
    });
  });

  describe('getAlertsForProperty', () => {
    const propertyRef = '000012712';
    beforeEach(() => {
      nock(baseUrl, {
        reqheaders: {
          Authorization: `Bearer ${apiToken}`
        }
      })
        .get(`/api/v1/cautionary-alerts/properties/${propertyRef}`)
        .reply(200, propertyResponse);
    });

    it('calls the API endpoint with valid parameters', async () => {
      const api = createGateway();
      const apiResponse = await api.alertsForProperty(propertyRef);
      expect(apiResponse).toEqual(propertyResponse);
      expect(nock.isDone()).toBe(true);
    });
  });

  describe('getAlertsForPropertyReturns404', () => {
    const propertyRef = '';
    beforeEach(() => {
      nock(baseUrl, {
        reqheaders: {
          Authorization: `Bearer ${apiToken}`
        }
      })
        .get(`/api/v1/cautionary-alerts/properties/${propertyRef}`)
        .reply(500, { alerts: [] });
    });

    it('returns an empty array if there are no query parameters', async () => {
      const api = createGateway();

      const apiResponse = await api.alertsForProperty('');
      expect(apiResponse.alerts.length).toBe(0);
      expect(logger.error).toHaveBeenCalledWith(
        'Error getting cautionary alerts for property: StatusCodeError: 500 - {"alerts":[]}',
        expect.anything()
      );
    });
  });
});
