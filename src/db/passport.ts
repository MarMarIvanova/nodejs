const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const { findByUsername, verifyPassword } = require('./users');

passport.use(
  new LocalStrategy((username, password, done) => {
    findByUsername(username, (err, user) => {
      if (err) return done(err);
      if (!user) return done(null, false, { message: 'Invalid login or password' });
      if (!verifyPassword(user, password)) return done(null, false, { message: 'Invalid login or password' });
      return done(null, user);
    });
  })
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  const { findById } = require('./users');
  findById(id, (err, user) => {
    done(err, user);
  });
});

module.exports = passport;
