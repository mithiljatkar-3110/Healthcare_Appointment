const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async ({ to, subject, text, html }) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('Email delivery skipped because SMTP credentials are not configured.');
    return {
      success: false,
      error: 'SMTP credentials are not configured.',
    };
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject,
      text,
      html,
    });

    return { success: true };
  } catch (error) {
    console.error('Email delivery failed:', error.message);
    return {
      success: false,
      error: error.message || 'Unknown email delivery failure.',
    };
  }
};

module.exports = { sendEmail };
