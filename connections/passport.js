const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'https://secret-scrubland-17327.herokuapp.com/users/google/callback',
    },
    function (accessToken, refreshToken, profile, cb) {
      return cb(null, profile._json)
    }
  )
);
