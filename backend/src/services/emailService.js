const nodemailer = require('nodemailer');
const env = require('../config/env');

let transporter = null;

// Initialize Nodemailer transporter if SMTP credentials are provided
if (env.smtpHost && env.smtpUser) {
  try {
    transporter = nodemailer.createTransport({
      host: env.smtpHost,
      port: env.smtpPort,
      secure: env.smtpPort === 465,
      connectionTimeout: 5000, // 5s timeout to prevent hanging
      greetingTimeout: 5000,
      auth: {
        user: env.smtpUser,
        pass: env.smtpPass
      }
    });
    console.log(`[Email Service] Configured with SMTP host: ${env.smtpHost}:${env.smtpPort}`);
  } catch (err) {
    console.warn(`[Email Service] Failed to initialize SMTP transporter: ${err.message}. Using fallback logging.`);
    transporter = null;
  }
}

/**
 * Send an OTP code to a user's email
 * @param {string} email Target recipient
 * @param {string} otp 6-digit verification code
 * @returns {Promise<{ sent: boolean, devOtp?: string }>}
 */
const sendOtpEmail = async (email, otp) => {
  const subject = `Your Scriptify Verification Code: ${otp}`;
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0b0e; color: #e4e4e7; padding: 40px 20px; border-radius: 12px; max-width: 500px; margin: 0 auto; border: 1px solid #282832;">
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="display: inline-block; width: 44px; height: 44px; line-height: 44px; border-radius: 10px; background: rgba(99, 102, 241, 0.2); color: #818cf8; font-size: 22px; font-weight: 900; margin-bottom: 12px; border: 1px solid rgba(99, 102, 241, 0.4);">
          Ae
        </div>
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: -0.5px;">Scriptify Studio</h1>
        <p style="color: #a1a1aa; margin: 6px 0 0 0; font-size: 13px;">Adobe After Effects ExtendScript & ScriptUI Platform</p>
      </div>
      <div style="background-color: #16161a; border: 1px solid #282832; border-radius: 10px; padding: 26px; text-align: center;">
        <p style="margin-top: 0; font-size: 14px; color: #d4d4d8;">Use the one-time verification code below to sign in:</p>
        <div style="display: inline-block; background-color: #1f1f26; border: 1px solid #6366f1; border-radius: 8px; padding: 14px 28px; margin: 18px 0;">
          <span style="font-family: 'Courier New', Courier, monospace; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #a5b4fc;">${otp}</span>
        </div>
        <p style="margin: 0; font-size: 12px; color: #71717a;">This verification code expires in 10 minutes. Do not share this code with anyone.</p>
      </div>
      <div style="text-align: center; margin-top: 24px; font-size: 11px; color: #52525b;">
        &copy; ${new Date().getFullYear()} Scriptify. Automated workflow tools for After Effects motion designers.
      </div>
    </div>
  `;

  if (transporter) {
    try {
      await transporter.sendMail({
        from: env.emailFrom,
        to: email,
        subject,
        html
      });
      console.log(`[Email] OTP sent successfully to ${email}`);
      return { sent: true };
    } catch (err) {
      console.error(`[Email Warning] SMTP send failed (${err.message}). Using local development console fallback.`);
    }
  }

  // Development Fallback: Clearly print OTP to console
  console.log('====================================================');
  console.log(`[DEV OTP DISPATCHED]`);
  console.log(`Recipient:         ${email}`);
  console.log(`Verification Code: [ ${otp} ]`);
  console.log(`Expires in:        10 minutes`);
  console.log('====================================================');

  return {
    sent: true,
    devOtp: env.isProduction ? undefined : otp
  };
};

module.exports = {
  sendOtpEmail
};
