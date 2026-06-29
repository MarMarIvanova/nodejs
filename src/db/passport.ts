import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { findByUsername, findById, verifyPassword, UserRecord } from './users';

passport.use(
    new LocalStrategy((username, password, done) => {
        findByUsername(username, (err, user) => {
            if (err) return done(err);
            if (!user) return done(null, false, { message: 'Invalid login or password' });
            if (!verifyPassword(user, password)) return done(null, false, { message: 'Invalid login or password' });
            return done(null, user);
        });
    }),
);

passport.serializeUser((user, done) => {
    done(null, (user as UserRecord).id);
});

passport.deserializeUser((id: number, done) => {
    findById(id, (err, user) => {
        done(err, user);
    });
});

export default passport;
