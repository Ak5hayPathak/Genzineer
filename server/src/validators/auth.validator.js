import { z } from "zod";

// Registration validation
const registerSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username cannot exceed 50 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    ),

  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name cannot exceed 100 characters"),

  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please provide a valid email address")
    .max(255, "Email cannot exceed 255 characters"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password cannot exceed 72 characters"),
});

// Login validation
const loginSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, "Email or username is required")
    .max(255, "Email or username cannot exceed 255 characters"),

  password: z
    .string()
    .min(1, "Password is required")
    .max(72, "Invalid password"),
});

export { registerSchema, loginSchema };
