const fs = require('fs');
const path = require('path');
const User = require('../models/user');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

const pathToKey = path.join(__dirname, '..', 'id_rsa_pub.pem');
const PUB_KEY = fs.readFileSync(pathToKey, 'utf8');

// const extractJwtfromCookie = (req) => {
//   let jwt = null;

//   if (req && req.cookies) {
//     jwt = req.cookies.access_token;
//   }

//   console.log(jwt);

//   return jwt;
// };

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: PUB_KEY,
  algorithms: ['RS256']
};

const strategy = new JwtStrategy(options, (payload, done) => {
  User.findOne({ _id: payload.sub }).select('-password')
    .then((user) => {
      if (user) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    })
    .catch(err => done(err, null));
});

module.exports = (passport) => {
  passport.use(strategy);
};
