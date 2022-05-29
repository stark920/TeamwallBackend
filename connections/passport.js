const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const DiscordStrategy = require('passport-discord').Strategy;

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:
        'https://secret-scrubland-17327.herokuapp.com/users/google/callback',
    },
    function (accessToken, refreshToken, profile, cb) {
      return cb(null, profile._json);
    }
  )
);

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      callbackURL:
        'https://secret-scrubland-17327.herokuapp.com/users/facebook/callback',
      profileFields: ['id', 'displayName', 'photos', 'email'],
    },
    function (accessToken, refreshToken, profile, cb) {
      return cb(null, profile._json);
    }
  )
);

passport.use(
  new DiscordStrategy(
    {
      clientID: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      callbackURL: 'https://secret-scrubland-17327.herokuapp.com/users/discord/callback',
      scope: ['identify', 'email'],
    },
    function (accessToken, refreshToken, profile, cb) {
      return cb(null, profile);
    }
  )
);
