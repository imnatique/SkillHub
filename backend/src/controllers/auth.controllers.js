import { generateJWTToken_email, generateJWTToken_username } from "../utils/generateJWTToken.js";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { User } from "../models/user.model.js";
import { UnRegisteredUser } from "../models/unRegisteredUser.model.js";
import dotenv from "dotenv";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { setAuthCookie } from "../utils/cookieOptions.js";

dotenv.config();

const CLIENT_URL = process.env.CLIENT_URL;

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    (accessToken, refreshToken, profile, done) => done(null, profile)
  )
);

export const googleAuthHandler = passport.authenticate("google", {
  scope: ["profile", "email"],
});

export const googleAuthCallback = passport.authenticate("google", {
  failureRedirect: `${CLIENT_URL}/login`,
  session: false,
});

export const handleGoogleLoginCallback = asyncHandler(async (req, res) => {
  const { email, name, picture } = req.user._json;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    setAuthCookie(res, "accessTokenRegistration", generateJWTToken_username(existingUser));
    return res.redirect(`${CLIENT_URL}/discover`);
  }

  let unregisteredUser = await UnRegisteredUser.findOne({ email });
  if (!unregisteredUser) {
    unregisteredUser = await UnRegisteredUser.create({ name, email, picture });
  }

  setAuthCookie(res, "accessTokenRegistration", generateJWTToken_email(unregisteredUser));
  return res.redirect(`${CLIENT_URL}/register`);
});

export const handleLogout = (req, res) => {
  res.clearCookie("accessTokenRegistration");
  return res.status(200).json(new ApiResponse(200, null, "User logged out successfully"));
};