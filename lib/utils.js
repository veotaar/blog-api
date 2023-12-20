const jsonwebtoken = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const pathToKey = path.join(__dirname, '..', 'id_rsa_priv.pem');
const PRIVATE_KEY = fs.readFileSync(pathToKey, 'utf-8');

const issueJWT = (user) => {
  const _id = user._id;
  const expiresIn = '45s';

  const payload = {
    sub: _id,
    iat: Math.floor(Date.now() / 1000)
  };

  const token = jsonwebtoken.sign(payload, PRIVATE_KEY, { expiresIn, algorithm: 'RS256' });

  return {
    token: `Bearer ${token}`,
    expires: expiresIn
  };
};

module.exports.issueJWT = issueJWT;
