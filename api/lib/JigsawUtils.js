const request = require('request-promise');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const loginUrl = process.env.JigsawLoginUrl;

let bearerToken = null;
let lastLogin = null;

const getCSRFTokens = async function() {
  const httpResponse = await request.get({
    url: loginUrl,
    resolveWithFullResponse: true
  });

  const cookies = httpResponse.headers['set-cookie'].map(
    cookie => cookie.split(';')[0]
  );

  const dom = new JSDOM(httpResponse.body);
  const token = dom.window.document.querySelector(
    'input[name=__RequestVerificationToken]'
  ).value;

  return {
    cookies,
    token
  };
};

const login = async function() {
  if (bearerToken && lastLogin && lastLogin > new Date() - 3600) {
    return bearerToken;
  } else {
    const tokens = await getCSRFTokens();
    // make auth request to Jigsaw
    const authCredentials = {
      Email: process.env.Jigsaw_email,
      Password: process.env.Jigsaw_password,
      __RequestVerificationToken: tokens.token
    };

    const httpResponse = await request.post({
      url: loginUrl,
      form: authCredentials,
      headers: {
        Cookie: tokens.cookies.join('; ')
      },
      resolveWithFullResponse: true,
      simple: false
    });

    for (const header of httpResponse.headers['set-cookie']) {
      const matched = header.match(/access_token=([^;]*)/);
      if (matched) {
        bearerToken = matched[1];
        lastLogin = new Date();
        return bearerToken;
      }
    }

    throw 'Could not get auth token';
  }
};

const doGetRequest = async function(uri, qs, headers, returnRaw) {
  let options = { uri };
  if (headers) options.headers = headers;
  if (qs) options.qs = qs;

  if (returnRaw) {
    options.encoding = null;
    return await request.get(options);
  }

  options.resolveWithFullResponse = true;
  const httpResponse = await request.get(options);
  return JSON.parse(httpResponse.body);
};

const doPostRequest = async function(url, json, headers) {
  let options = { url, json, resolveWithFullResponse: true };
  if (headers) options.headers = headers;

  const httpResponse = await request.post(options);
  return httpResponse.body;
};

const doJigsawGetRequest = async function(url, qs, returnRaw) {
  const token = await login();

  return doGetRequest(url, qs, { Authorization: `Bearer ${token}` }, returnRaw);
};

const doJigsawPostRequest = async function(url, json) {
  const token = await login();
  return doPostRequest(url, json, { Authorization: `Bearer ${token}` });
};

module.exports = {
  doJigsawGetRequest,
  doJigsawPostRequest,
  doGetRequest,
  login
};
