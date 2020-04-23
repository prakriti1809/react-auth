const express = require('express');
require('dotenv').config();
const jwt = require("express-jwt"); // Validate JWT and set req.user
const jwksRsa = require("jwks-rsa"); // Retrieve RSA keys from a JSON Web Key set (JWKS) endpoint
const checkScope = require("express-jwt-authz"); // Check scopes

const checkJwt = jwt({
  // Dynamically provide a signing key based on the kid in the header
  // and the signing keys provided by the JWKS endpoint.
  secret: jwksRsa.expressJwtSecret({
    cache: true, // cache the signing key
    rateLimit: true,
    jwksRequestsPerMinute: 5, // prevent attackers from requesting more than 5 per minute
    jwksUri: `https://${
      process.env.REACT_APP_AUTH0_DOMAIN
      }/.well-known/jwks.json`
  }),

  // Validate the audience and the issuer.
  audience: process.env.REACT_APP_AUTH0_AUDIENCE,
  issuer: `https://${process.env.REACT_APP_AUTH0_DOMAIN}/`,

  // This must match the algorithm selected in the Auth0 dashboard under your app's advanced settings under the OAuth tab
  algorithms: ["RS256"]
});

const app = express();

const checkRole = function (role) {
  return function (req, res, next) {
    const assignedRoles = req.user['http://localhost:3000/roles'];
    if (Array.isArray(assignedRoles) && assignedRoles.includes(role)) {
      return next();
    } else {
      res.status(401).send('Insufficient role.');
    }
  };
};

app.get("/public", function (req, res) {
  res.json({
    message: "Hello from a public API!"
  });
});

app.get("/private", checkJwt, function (req, res) {
  res.json({
    message: "Hello from a private API!"
  });
});

app.get("/course", checkJwt, checkScope(['read:courses']), function (req, res) {
  res.json([
    { id: 1, title: 'Securing React Apps with Auth0' },
    { id: 2, title: 'Building Applications with React and Flux' },
  ]);
});

app.get("/admin", checkJwt, checkRole('admin'), function (req, res) {
  res.json({
    message: "Hello from admin API!"
  });
});

app.listen(3001);
console.log("API server listening on " + process.env.REACT_APP_AUTH0_AUDIENCE);
