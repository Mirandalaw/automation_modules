import passport from 'passport';
import { Strategy as GoogleStrategy, Profile } from 'passport-google-oauth20';
import { findOrCreateUser } from '../services/oauth.service';
import logger from '../common/logger';
import { Express } from 'express';

const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL,
} = process.env;

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_CALLBACK_URL) {
  throw new Error(' Google OAuth 환경변수가 설정되지 않았습니다.');
}

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: GOOGLE_CALLBACK_URL,
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: Profile,
      done
    ) => {
      try {
        logger.debug(`[Passport] Google OAuth 시작 - ID: ${profile.id}`);

        const user = await findOrCreateUser(profile);

        logger.info(`[Passport] Google OAuth 성공 - Email: ${user.email}`);

        // ✅ 명확한 타입 단언
        return done(null, user as Express.User);
      } catch (err: any) {
        logger.error(`[Passport] Google OAuth 실패: ${err.message}`);
        return done(err);
      }
    }
  )
);
