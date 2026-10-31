import "dotenv/config";
import { sendEmail } from "../services/email.service.js";

const testEmail = async () => {
  try {
    const result = await sendEmail({
      to: "akshaypathak0821@gmail.com",
      subject: "GenZineer Email Service Test",
      htmlBody: `
        <div style="font-family: Arial, sans-serif;">
          <h2>Welcome to GenZineer!</h2>
          <p>Your Google Apps Script email integration is working.</p>
        </div>
      `,
    });

    console.log(result);
  } catch (error) {
    console.error(error.message);
  }
};

testEmail();
