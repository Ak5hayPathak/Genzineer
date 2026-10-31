import {
  registerUser,
  loginUser,
  refreshUserTokens,
  logoutUser,
} from "../services/auth.service.js";

import { findUserById } from "../repositories/user.repository.js";
import ApiError from "../utils/ApiError.utils.js";

// Cookie configuration
const isProduction = process.env.NODE_ENV === "production";

const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  path: "/",
};

const accessTokenOptions = {
  ...cookieOptions,
  maxAge: 15 * 60 * 1000,
};

const refreshTokenOptions = {
  ...cookieOptions,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

// Set authentication cookies
const setAuthCookies = (res, accessToken, refreshToken) => {
  res.cookie("accessToken", accessToken, accessTokenOptions);
  res.cookie("refreshToken", refreshToken, refreshTokenOptions);
};

// Register a new user
const register = async (req, res) => {
  const { username, fullName, email, password } = req.body;

  const result = await registerUser({
    username,
    fullName,
    email,
    password,
  });

  setAuthCookies(res, result.accessToken, result.refreshToken);

  return res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: {
      user: result.user,
    },
  });
};

// Login an existing user
const login = async (req, res) => {
  const { email, password } = req.body;

  const result = await loginUser({ email, password });

  setAuthCookies(res, result.accessToken, result.refreshToken);

  return res.status(200).json({
    success: true,
    message: "Login successful",
    data: {
      user: result.user,
    },
  });
};

// Refresh authentication tokens
const refresh = async (req, res) => {
  const result = await refreshUserTokens(req.cookies?.refreshToken);

  setAuthCookies(res, result.accessToken, result.refreshToken);

  return res.status(200).json({
    success: true,
    message: "Tokens refreshed successfully",
  });
};

// Logout the current session
const logout = async (req, res) => {
  await logoutUser(req.cookies?.refreshToken);

  res.clearCookie("accessToken", cookieOptions);
  res.clearCookie("refreshToken", cookieOptions);

  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

// Get the currently authenticated user
const getCurrentUser = async (req, res) => {
  const user = await findUserById(req.user.id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res.status(200).json({
    success: true,
    message: "Current user fetched successfully",
    data: {
      user,
    },
  });
};

export { register, login, refresh, logout, getCurrentUser };
