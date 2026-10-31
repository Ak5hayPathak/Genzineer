const createEmailVerificationTemplate = ({ fullName, verificationUrl }) => {
  const safeName = String(fullName || "there").replace(
    /[&<>"']/g,
    (character) => {
      const entities = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      };

      return entities[character];
    }
  );

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Verify your email</title>
      </head>

      <body style="
        margin: 0;
        padding: 32px 16px;
        background-color: #f4f4f5;
        font-family: Arial, sans-serif;
        color: #18181b;
      ">
        <div style="
          max-width: 520px;
          margin: 0 auto;
          padding: 32px;
          background-color: #ffffff;
          border-radius: 12px;
        ">
          <h1 style="margin-top: 0; font-size: 24px;">
            Welcome to GenZineer!
          </h1>

          <p>Hello ${safeName},</p>

          <p>
            Thanks for creating your GenZineer account.
            Please verify your email address to confirm that
            you own this email account.
          </p>

          <div style="margin: 32px 0;">
            <a
              href="${verificationUrl}"
              style="
                display: inline-block;
                padding: 14px 24px;
                background-color: #18181b;
                color: #ffffff;
                text-decoration: none;
                border-radius: 8px;
                font-weight: bold;
              "
            >
              Verify Email Address
            </a>
          </div>

          <p>
            This verification link will expire in 24 hours.
            It can only be used once.
          </p>

          <p>
            If you didn't create a GenZineer account,
            you can safely ignore this email.
          </p>

          <hr style="
            margin: 32px 0;
            border: none;
            border-top: 1px solid #e4e4e7;
          " />

          <p style="font-size: 12px; color: #71717a;">
            GenZineer — Technical knowledge, thoughtfully documented.
          </p>
        </div>
      </body>
    </html>
  `;
};

export { createEmailVerificationTemplate };
