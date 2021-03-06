const authorizer = require('node-lambda-authorizer')({
  jwtSecret: process.env.jwtsecret,
  allowedGroups: process.env.allowedGroups.split(',')
});

exports.handler = authorizer.handler;
