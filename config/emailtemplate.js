const Welcome_Email_Template = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Account Activation</title>
  </head>
  <body
    style="
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    "
  >
    <div
      style="
        background: #E2063A;
        padding: 20px;
        text-align: center;
      "
    >
      <h1 style="color: white; margin: 0">Welcome</h1>
    </div>
    <div
      style="
        background-color: #f9f9f9;
        padding: 20px;
        border-radius: 0 0 5px 5px;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
      "
    >
      <p>Hello, {name}!</p>
      <p>Thank you for signing up!</p>
      <p>If you didn't create an account with us, please ignore this email.</p>
      <p>Best regards,<br />Coding Stars Team</p>
    </div>
    <div
      style="
        text-align: center;
        margin-top: 20px;
        color: #888;
        font-size: 0.8em;
      "
    >
      <p>This is an automated message, please do not reply to this email.</p>
    </div>
  </body>
</html>
`;

const VERIFICATION_EMAIL_TEMPLATE = `
        <!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Verify Your Email</title>
  </head>
  <body
    style="
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: black;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    "
  >
    <div
      style="
        background: #E2063A;
        padding: 20px;
        text-align: center;
      "
    >
      <h1 style="color: white; margin: 0">Verify Your Email</h1>
    </div>
    <div
      style="
        background-color: #f9f9f9;
        padding: 20px;
        border-radius: 0 0 5px 5px;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
      "
    >
      <p>Hello,</p>
      <p>Thank you for signing up! Your verification code is:</p>
      <div style="text-align: center; margin: 30px 0">
        <span
          style="
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 5px;
            color: #E2063A;
          "
          >{verificationCode}</span
        >
      </div>
      <p>
        Enter this code on the verification page to complete your registration.
      </p>
      <p>This code will expire in 1 hour for security reasons.</p>
      <p>If you didn't create an account with us, please ignore this email.</p>
      <p>Best regards,<br />Coding Stars</p>
    </div>
    <div
      style="
        text-align: center;
        margin-top: 20px;
        color: #888;
        font-size: 0.8em;
      "
    >
      <p>This is an automated message, please do not reply to this email.</p>
    </div>
  </body>
</html>
`;

const RESET_EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Reset your Password</title>
  </head>
  <body
    style="
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    "
  >
    <div
      style="
        background: #E2063A;
        padding: 20px;
        text-align: center;
      "
    >
      <h1 style="color: white; margin: 0">Verify Your Email with OTP</h1>
    </div>
    <div
      style="
        background-color: #f9f9f9;
        padding: 20px;
        border-radius: 0 0 5px 5px;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
      "
    >
      <p>Hello,</p>
      <p>Thank you for signing up! Your verification code is:</p>
      <div style="text-align: center; margin: 30px 0">
        <span
          style="
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 5px;
            color: #E2063A;
          "
          >{verificationCode}</span
        >
      </div>
      <p>Enter this code on the for resetting your password.</p>
      <p>This code will expire in 10 minutes for security reasons.</p>
      <p>
        If you haven't made this request, please mail us at
        support@codingstars.com.
      </p>
      <p>Best regards,<br />Brand</p>
    </div>
    <div
      style="
        text-align: center;
        margin-top: 20px;
        color: #888;
        font-size: 0.8em;
      "
    >
      <p>This is an automated message, please do not reply to this email.</p>
    </div>
  </body>
</html>`;

module.exports = {
  Welcome_Email_Template,
  VERIFICATION_EMAIL_TEMPLATE,
  RESET_EMAIL_TEMPLATE,
};
