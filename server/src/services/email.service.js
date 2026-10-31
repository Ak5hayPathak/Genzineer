import ApiError from "../utils/ApiError.utils.js";

const GOOGLE_APPS_SCRIPT_URL = process.env.GOOGLE_APPS_SCRIPT_URL;
const EMAIL_API_SECRET = process.env.EMAIL_API_SECRET;

// Send an email through Google Apps Script.
const sendEmail = async ({ to, subject, htmlBody }) => {
  if (!GOOGLE_APPS_SCRIPT_URL || !EMAIL_API_SECRET) {
    throw new ApiError(500, "Email service is not configured");
  }

  if (!to || !subject || !htmlBody) {
    throw new ApiError(400, "Recipient, subject, and email body are required");
  }

  try {
    const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        secret: EMAIL_API_SECRET,
        to,
        subject,
        htmlBody,
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      throw new Error(`Apps Script returned HTTP ${response.status}`);
    }

    const result = await response.json();

    if (!result.success) {
      console.error("Google Apps Script email error:", result.message);

      throw new Error("Email delivery was unsuccessful");
    }

    return {
      success: true,
      message: "Email sent successfully",
    };
  } catch (error) {
    console.error("Email delivery failed:", error.message);

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(502, "Unable to send email. Please try again later.");
  }
};

export { sendEmail };
