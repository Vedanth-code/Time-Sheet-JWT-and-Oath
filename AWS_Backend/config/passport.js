import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { createConnection } from "../Configuration.js";

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: 'https://dw3amckjax0vt.cloudfront.net/api/auth/google/callback'
},
  async (accessToken, refreshToken, profile, done) => {
    try {
      const db = await createConnection();
      // Check if user exists by Google ID
      const [users] = await db.query(
        'SELECT * FROM users WHERE google_id = ?',
        [profile.id]
      );

      if (users.length > 0) {
        // User exists, return user
        return done(null, users[0]);
      }

      // Check if email already exists (for linking accounts)
      const [emailUsers] = await db.query(
        'SELECT * FROM users WHERE email = ?',
        [profile.emails[0].value]
      );

      if (emailUsers.length > 0) {
        // Link Google account to existing user
        await db.query(
          'UPDATE users SET google_id = ?, avatar = ? WHERE id = ?',
          [profile.id, profile.photos[0].value, emailUsers[0].id]
        );
        return done(null, emailUsers[0]);
      }

      // Create new user
      const [result] = await db.query(
        `INSERT INTO users (email, name, google_id, avatar, auth_provider) 
         VALUES (?, ?, ?, ?, 'google')`,
        [
          profile.emails[0].value,
          profile.displayName,
          profile.id,
          profile.photos[0].value
        ]
      );

      const newUser = {
        id: result.insertId,
        email: profile.emails[0].value,
        name: profile.displayName,
        google_id: profile.id,
        avatar: profile.photos[0].value
      };

      return done(null, newUser);

    } catch (error) {
      console.error('OAuth error:', error);
      return done(error, null);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const db = await createConnection();
    const [users] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    done(null, users[0]);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
