import { generateEmailVerificationToken } from "./email-verification.service.js";
import { sendEmail } from "./email.service.js";

import { createEmailVerificationTemplate } from "../utils/email-templates.utils.js";

const sendVerificationEmail = async ({ userId, email, fullName }) => {
  const { token } = await generateEmailVerificationToken(userId);

  const backendUrl = process.env.BACKEND_URL;

  if (!backendUrl) {
    throw new Error("BACKEND_URL is not configured");
  }

  const verificationUrl = new URL("/api/auth/verify-email", backendUrl);

  verificationUrl.searchParams.set("token", token);

  const htmlBody = createEmailVerificationTemplate({
    fullName,
    verificationUrl: verificationUrl.toString(),
  });

  await sendEmail({
    to: email,
    subject: "Verify your GenZineer email address",
    htmlBody,
  });

  return {
    success: true,
    message: "Verification email sent successfully",
  };
};

export { sendVerificationEmail };
