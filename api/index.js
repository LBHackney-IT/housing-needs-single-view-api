require('dotenv').config();
const serverless = require('serverless-http');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const querystring = require('querystring');
const QueryHandler = require('./lib/QueryHandler');
const {
  customerSearch,
  fetchDocuments,
  fetchNotes,
  fetchRecords
} = require('./lib/libDependencies');

if (process.env.ENV === 'staging' || process.env.ENV === 'production') {
  const Sentry = require('@sentry/node');

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.ENV
  });

  // The request handler must be the first middleware on the app
  app.use(Sentry.Handlers.requestHandler());

  // The error handler must be before any other error middleware and after all controllers
  app.use(Sentry.Handlers.errorHandler());
}

app.use(bodyParser.json());

app.use(function(req, res, next) {
  if (req.headers.authorization) {
    res.locals.hackneyToken = req.headers.authorization.replace('Bearer ', '');
  }
  next();
});

// CORS
app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

app.get('/customers', async (req, res) => {
  const q = querystring.stringify(req.query);
  console.log(`CUSTOMER SEARCH "${q}"`);
  console.time(`CUSTOMER SEARCH "${q}"`);
  const results = await customerSearch(req.query);
  console.timeEnd(`CUSTOMER SEARCH "${q}"`);
  res.send(results);
});

app.post('/customers', async (req, res) => {
  console.log('SAVING CUSTOMER');
  console.time('SAVING CUSTOMER');
  // Save the selected customer records
  const customer = await QueryHandler.saveCustomer(req.body.customers);
  console.timeEnd('SAVING CUSTOMER');
  res.send({ customer });
});

app.delete('/customers/:id', async (req, res) => {
  console.log(`DELETE CUSTOMER id="${req.params.id}"`);
  console.time(`DELETE CUSTOMER id="${req.params.id}"`);
  await QueryHandler.deleteCustomer(req.params.id);
  console.timeEnd(`DELETE CUSTOMER id="${req.params.id}"`);
  res.sendStatus(200);
});

app.get('/customers/:id/record', async (req, res) => {
  console.log(`GET CUSTOMER id="${req.params.id}"`);
  console.time(`GET CUSTOMER id="${req.params.id}"`);
  const result = await fetchRecords(req.params.id);
  console.timeEnd(`GET CUSTOMER id="${req.params.id}"`);
  res.send({ customer: result });
});

app.get('/customers/:id/notes', async (req, res) => {
  console.log(`GET CUSTOMER NOTES id="${req.params.id}"`);
  console.time(`GET CUSTOMER NOTES id="${req.params.id}"`);
  const results = await fetchNotes(req.params.id, res.locals.hackneyToken);
  console.timeEnd(`GET CUSTOMER NOTES id="${req.params.id}"`);
  res.send(results);
});

app.get('/customers/:id/documents', async (req, res) => {
  console.log(`GET CUSTOMER DOCS id="${req.params.id}"`);
  console.time(`GET CUSTOMER DOCS id="${req.params.id}"`);
  const results = await fetchDocuments(req.params.id, res.locals.hackneyToken);
  console.timeEnd(`GET CUSTOMER DOCS id="${req.params.id}"`);
  res.send(results);
});

module.exports = {
  handler: serverless(app)
};
