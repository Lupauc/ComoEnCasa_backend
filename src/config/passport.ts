import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { env } from './env';
import User from '../models/User';
import { DEFAULT_AVATAR_URL } from './defaults';

passport.use(
    new GoogleStrategy(
            {
                clientID: env.GOOGLE_CLIENT_ID,
                clientSecret: env.GOOGLE_CLIENT_SECRET,
                callbackURL: env.BACKEND_URL
                    ? `${env.BACKEND_URL}/api/auth/google/callback`
                    : `/api/auth/google/callback`,
            },
        async (_accessToken, _refreshToken, profile, done) => {
            try {
                const email = profile.emails?.[0]?.value;
                if (!email) return done(new Error('Google no ha devuelto ningún correo electrónico.'), undefined);
                let user = await User.findOne({ $or: [{ googleId: profile.id }, { email }] });

                if (user) {
                    if (!user.googleId) {
                        user.googleId = profile.id;
                        user.isEmailVerified = true;
                        if (!user.avatar) user.avatar = profile.photos?.[0]?.value || DEFAULT_AVATAR_URL;
                        await user.save();
                    }
                    return done(null, user);
                }
                user = await User.create({
                    googleId: profile.id,
                    name: profile.displayName,
                    email,
                    avatar: profile.photos?.[0]?.value || DEFAULT_AVATAR_URL,
                    isEmailVerified: true,
                    role: 'customer',
                });

                return done(null, user);
            } catch (error) {
                return done(error as Error, undefined);
            }
        }
    )
);

export default passport;
