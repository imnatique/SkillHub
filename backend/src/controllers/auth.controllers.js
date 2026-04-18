import {
  generateJWTToken_email,
  generateJWTToken_username,
} from "../utils/generateJWTToken.js";
import { User } from "../models/user.model.js";
import { UnRegisteredUser } from "../models/unRegisteredUser.model.js";
import dotenv from "dotenv";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { setAuthCookie } from "../utils/cookieOptions.js";

dotenv.config();

export const googleLogin = asyncHandler(async (req, res) => {
  const { access_token } = req.body;
  if (!access_token) throw new ApiError(400, "Google token missing");

  const response = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${access_token}` },
  });

  if (!response.ok) throw new ApiError(401, "Invalid Google token");

  const { email, name, picture } = await response.json();

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    setAuthCookie(res, "accessTokenRegistration", generateJWTToken_username(existingUser));
    return res.status(200).json(new ApiResponse(200, existingUser, "Login successful"));
  }

  let unregisteredUser = await UnRegisteredUser.findOne({ email });
  if (!unregisteredUser) {
    unregisteredUser = await UnRegisteredUser.create({ name, email, picture });
  }

  setAuthCookie(res, "accessTokenRegistration", generateJWTToken_email(unregisteredUser));
  return res.status(200).json(new ApiResponse(200, { isNew: true }, "Registration required"));
});

export const handleLogout = (req, res) => {
  res.clearCookie("accessTokenRegistration");
  return res.status(200).json(new ApiResponse(200, null, "User logged out successfully"));
};