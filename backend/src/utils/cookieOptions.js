import dotenv from "dotenv";
dotenv.config();

const isProd = process.env.NODE_ENV === "production";

export const getAuthCookieOptions = () => ({
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? "none" : "lax",
  ...(isProd && { partitioned: true }),
  expires: new Date(Date.now() + 1 * 60 * 60 * 1000),
});

export const setAuthCookie = (res, cookieName, token) =>
  res.cookie(cookieName, token, getAuthCookieOptions());