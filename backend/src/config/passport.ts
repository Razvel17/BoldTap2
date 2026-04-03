// Passport OAuth Strategy Configuration
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import { AppDataSource } from "./database";
import { User } from "../entities/User";
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL, GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, GITHUB_CALLBACK_URL } from "./env";

const userRepo = () => AppDataSource.getRepository(User);

// Serialize user to session
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await userRepo().findOne({ where: { id } });
    done(null, user);
  } catch (error) {
    done(error);
  }
});

// Google OAuth Strategy
if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: GOOGLE_CALLBACK_URL,
      },
      async (_accessToken: any, _refreshToken: any, profile: any, done: any) => {
        try {
          done(null, {
            id: profile.id,
            email: profile.emails?.[0]?.value,
            displayName: profile.displayName,
            provider: "google",
          });
        } catch (error) {
          done(error);
        }
      },
    ),
  );
}

// GitHub OAuth Strategy
if (GITHUB_CLIENT_ID && GITHUB_CLIENT_SECRET) {
  passport.use(
    new GitHubStrategy(
      {
        clientID: GITHUB_CLIENT_ID,
        clientSecret: GITHUB_CLIENT_SECRET,
        callbackURL: GITHUB_CALLBACK_URL,
      },
      async (_accessToken: any, _refreshToken: any, profile: any, done: any) => {
        try {
          done(null, {
            id: profile.id,
            email: profile.emails?.[0]?.value,
            username: profile.username,
            displayName: profile.displayName,
            provider: "github",
            emails: profile.emails,
          });
        } catch (error) {
          done(error);
        }
      },
    ),
  );
}

export default passport;
