"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Passport OAuth Strategy Configuration
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const passport_github2_1 = require("passport-github2");
const database_1 = require("./database");
const User_1 = require("../entities/User");
const env_1 = require("./env");
const userRepo = () => database_1.AppDataSource.getRepository(User_1.User);
// Serialize user to session
passport_1.default.serializeUser((user, done) => {
    done(null, user.id);
});
// Deserialize user from session
passport_1.default.deserializeUser(async (id, done) => {
    try {
        const user = await userRepo().findOne({ where: { id } });
        done(null, user);
    }
    catch (error) {
        done(error);
    }
});
// Google OAuth Strategy
if (env_1.GOOGLE_CLIENT_ID && env_1.GOOGLE_CLIENT_SECRET) {
    passport_1.default.use(new passport_google_oauth20_1.Strategy({
        clientID: env_1.GOOGLE_CLIENT_ID,
        clientSecret: env_1.GOOGLE_CLIENT_SECRET,
        callbackURL: env_1.GOOGLE_CALLBACK_URL,
    }, async (_accessToken, _refreshToken, profile, done) => {
        try {
            done(null, {
                id: profile.id,
                email: profile.emails?.[0]?.value,
                displayName: profile.displayName,
                provider: "google",
            });
        }
        catch (error) {
            done(error);
        }
    }));
}
// GitHub OAuth Strategy
if (env_1.GITHUB_CLIENT_ID && env_1.GITHUB_CLIENT_SECRET) {
    passport_1.default.use(new passport_github2_1.Strategy({
        clientID: env_1.GITHUB_CLIENT_ID,
        clientSecret: env_1.GITHUB_CLIENT_SECRET,
        callbackURL: env_1.GITHUB_CALLBACK_URL,
    }, async (_accessToken, _refreshToken, profile, done) => {
        try {
            done(null, {
                id: profile.id,
                email: profile.emails?.[0]?.value,
                username: profile.username,
                displayName: profile.displayName,
                provider: "github",
                emails: profile.emails,
            });
        }
        catch (error) {
            done(error);
        }
    }));
}
exports.default = passport_1.default;
//# sourceMappingURL=passport.js.map