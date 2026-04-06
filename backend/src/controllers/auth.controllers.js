import {
  generateJWTToken_email,
  generateJWTToken_username,
} from "../utils/generateJWTToken.js";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { User } from "../models/user.model.js";
import { UnRegisteredUser } from "../models/unRegisteredUser.model.js";
import dotenv from "dotenv";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

dotenv.config();

const CLIENT_URL = process.env.CLIENT_URL;

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      done(null, profile);
    }
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
  const existingUser = await User.findOne({ email: req.user._json.email });

  if (existingUser) {
    const jwtToken = generateJWTToken_username(existingUser);
    const expiryDate = new Date(Date.now() + 1 * 60 * 60 * 1000);
    res.cookie("accessToken", jwtToken, {
      httpOnly: true,
      expires: expiryDate,
      sameSite: "Lax",
      secure: process.env.NODE_ENV === "production",
    });
    return res.redirect(`${CLIENT_URL}/discover`);
  }

  let unregisteredUser = await UnRegisteredUser.findOne({
    email: req.user._json.email,
  });
  if (!unregisteredUser) {
    unregisteredUser = await UnRegisteredUser.create({
      name: req.user._json.name,
      email: req.user._json.email,
      picture: req.user._json.picture,
    });
  }
  const jwtToken = generateJWTToken_email(unregisteredUser);
  const expiryDate = new Date(Date.now() + 0.5 * 60 * 60 * 1000);
  res.cookie("accessTokenRegistration", jwtToken, {
    httpOnly: true,
    expires: expiryDate,
    sameSite: "Lax",
    secure: process.env.NODE_ENV === "production",
  });
  return res.redirect(`${CLIENT_URL}/register`);
});

export const handleLogout = (req, res) => {
  res.clearCookie("accessToken");
  return res
    .status(200)
    .json(new ApiResponse(200, null, "User logged out successfully"));
};