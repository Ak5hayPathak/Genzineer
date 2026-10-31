import {
  registerUser,
  loginUser,
  refreshUserTokens,
  logoutUser,
} from "../services/auth.service.js";

import { randomBytes, timingSafeEqual } from "node:crypto";
import { verifyEmailAddress } from "../services/email-verification.service.js";

import {
  getGoogleAuthUrl,
  authenticateGoogleUser,
} from "../services/google-auth.service.js";

import { sendVerificationEmail } from "../services/email-verification-email.service.js";

import { findUserById } from "../repositories/user.repository.js";

import ApiError from "../utils/ApiError.utils.js";

// Frontend URL
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

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

// Google OAuth state cookie configuration
const googleStateCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "lax",
  path: "/api/auth/google/callback",
  maxAge: 5 * 60 * 1000,
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

  // Attempt to send the email verification link.
  let verificationEmailSent = false;

  try {
    await sendVerificationEmail({
      userId: result.user.id,
      email: result.user.email,
      fullName: result.user.full_name,
    });

    verificationEmailSent = true;
  } catch (error) {
    console.error("Verification email sending failed:", error.message);
  }

  // Set authentication cookies.
  setAuthCookies(res, result.accessToken, result.refreshToken);

  return res.status(201).json({
    success: true,
    message: verificationEmailSent
      ? "Registration successful. Please verify your email."
      : "Registration successful, but verification email could not be sent.",
    data: {
      user: result.user,
      verificationEmailSent,
    },
  });
};

// Login an existing user
const login = async (req, res) => {
  const { identifier, password } = req.body;

  const result = await loginUser({ identifier, password });

  setAuthCookies(res, result.accessToken, result.refreshToken);

  return res.status(200).json({
    success: true,
    message: "Login successful",
    data: {
      user: result.user,
    },
  });
};

// Verify a user's email address
const verifyEmail = async (req, res) => {
  const { token } = req.query;

  const user = await verifyEmailAddress(token);

  return res.status(200).json({
    success: true,
    message: "Email address verified successfully",
    data: {
      user,
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

// Start Google OAuth
const googleLogin = (req, res) => {
  const state = randomBytes(32).toString("hex");

  res.cookie("googleOAuthState", state, googleStateCookieOptions);

  const authUrl = getGoogleAuthUrl(state);

  return res.redirect(authUrl);
};

// Handle Google's callback
const googleCallback = async (req, res) => {
  const { code, state, error } = req.query;

  const storedState = req.cookies?.googleOAuthState;

  // Clear OAuth state cookie after callback
  res.clearCookie("googleOAuthState", googleStateCookieOptions);

  // Redirect to frontend with an error
  const redirectWithError = (errorCode) => {
    return res.redirect(
      `${frontendUrl}/auth/callback?error=${encodeURIComponent(errorCode)}`
    );
  };

  // Google returned an error
  if (error) {
    return redirectWithError("google_auth_cancelled");
  }

  // Validate callback parameters
  if (
    typeof code !== "string" ||
    typeof state !== "string" ||
    typeof storedState !== "string"
  ) {
    return redirectWithError("invalid_google_callback");
  }

  // Validate OAuth state to prevent CSRF
  const receivedState = Buffer.from(state);
  const expectedState = Buffer.from(storedState);

  if (
    receivedState.length !== expectedState.length ||
    !timingSafeEqual(receivedState, expectedState)
  ) {
    return redirectWithError("invalid_google_state");
  }

  try {
    const result = await authenticateGoogleUser(code);

    // Set authentication cookies
    setAuthCookies(res, result.accessToken, result.refreshToken);

    // Redirect to frontend after successful authentication
    return res.redirect(`${frontendUrl}/auth/callback`);
  } catch (error) {
    console.error("Google OAuth callback failed:", error.message);

    if (error.statusCode === 409) {
      return redirectWithError("google_account_exists");
    }

    return redirectWithError("google_auth_failed");
  }
};

export {
  register,
  login,
  refresh,
  logout,
  getCurrentUser,
  verifyEmail,
  googleLogin,
  googleCallback,
};
