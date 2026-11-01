import ApiError from "../utils/ApiError.utils.js";

// Send an email through Google Apps Script.
const sendEmail = async ({ to, subject, htmlBody }) => {
  const scriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL;
  const emailApiSecret = process.env.EMAIL_API_SECRET;

  if (!scriptUrl || !emailApiSecret) {
    throw new ApiError(500, "Email service is not configured");
  }

  if (!to || !subject || !htmlBody) {
    throw new ApiError(400, "Recipient, subject, and email body are required");
  }

  let url;

  try {
    url = new URL(scriptUrl);
  } catch {
    throw new ApiError(500, "Email service URL is invalid");
  }

  if (url.protocol !== "https:") {
    throw new ApiError(500, "Email service must use HTTPS");
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        secret: emailApiSecret,
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

    if (!result?.success) {
      throw new Error(result?.message || "Email delivery was unsuccessful");
    }

    return {
      success: true,
      message: "Email sent successfully",
    };
  } catch (error) {
    console.error("Email delivery failed:", error.message);

    throw new ApiError(502, "Unable to send email. Please try again later.");
  }
};

export { sendEmail };
