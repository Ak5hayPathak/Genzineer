import { Router } from "express";

import {
  register,
  login,
  refresh,
  logout,
  getCurrentUser,
  verifyEmail,
  googleLogin,
  googleCallback,
} from "../controllers/auth.controller.js";

import { validate } from "../middlewares/validate.middleware.js";
import { authenticate } from "../middlewares/auth.middleware.js";

import { registerSchema, loginSchema } from "../validators/auth.validator.js";

const router = Router();

// Email/password authentication.
router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);

// Email verification.
router.get("/verify-email", verifyEmail);

// Google OAuth authentication.
router.get("/google", googleLogin);
router.get("/google/callback", googleCallback);

// Session management.
router.post("/refresh-token", refresh);
router.post("/logout", logout);

// Current authenticated user.
router.get("/me", authenticate, getCurrentUser);

export default router;
