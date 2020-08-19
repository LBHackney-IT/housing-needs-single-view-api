const path = require('path');
const { formatRecordDate, loadSQL } = require('../../Utils');
const { Systems } = require('../../Constants');
const { fetchTenancySQL } = loadSQL(path.join(__dirname, 'sql'));

module.exports = options => {
  const db = options.db;
  const logger = options.logger;

  async function fetchTenancy(tag_ref) {
    // return await db.request(fetchTenancySQL, [
    //   { id: 'tag_ref', type: 'NVarChar', value: tag_ref }
    // ]);
    return {
      id: '123456/1',
      address: '1 Hill Street N16 5TT',
      type: 'Secure',
      startDate: '1992-06-13',
      residents: [
        {
          title: 'Mrs',
          forename: 'Joan',
          surname: 'Fisher',
          fullName: 'Mrs Joan Fisher',
          dob: '1970-02-30',
          mobileNum: '07777123456',
          homeNum: '02088881234',
          workNum: '02012345678',
          email: 'mjf@email.com'
        },
        {
          title: 'Miss',
          forename: 'Sally',
          surname: 'Fisher',
          fullName: 'Miss Sally Fisher',
          dob: '1990-03-21',
          mobileNum: '07777456789',
          homeNum: '02088881234',
          workNum: '02077775678',
          email: 'sallyfisher90@email.com'
        }
      ]
    };
  }

  const processTenancy = function(tenancy) {
    return tenancy;
  };

  return {
    execute: async id => {
      try {
        const tenancy = await fetchTenancy(id);
        return processTenancy(tenancy);
      } catch (err) {
        logger.error(`Error fetching tenancy in UHT-Tenancies: ${err}`, err);
      }
      return [];
    }
  };
};