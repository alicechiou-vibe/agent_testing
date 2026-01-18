import emailjs from '@emailjs/browser';

// TODO: Replace these placeholders with your actual EmailJS credentials
// You can get these from https://dashboard.emailjs.com/
export const EMAILJS_CONFIG = {
  SERVICE_ID: "YOUR_SERVICE_ID",   // e.g., "service_xyz"
  TEMPLATE_ID: "YOUR_TEMPLATE_ID", // e.g., "template_abc"
  PUBLIC_KEY: "YOUR_PUBLIC_KEY"    // e.g., "user_123456"
};

export const sendEmail = async (toEmail: string, subject: string, message: string) => {
  if (EMAILJS_CONFIG.PUBLIC_KEY === "YOUR_PUBLIC_KEY") {
    console.warn("EmailJS not configured. Please update services/emailService.ts");
    throw new Error("EmailJS credentials not configured in code.");
  }

  try {
    const templateParams = {
      to_email: toEmail,
      subject: subject,
      message: message, // Make sure your EmailJS template uses {{message}} variable
    };

    const response = await emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.TEMPLATE_ID,
      templateParams,
      EMAILJS_CONFIG.PUBLIC_KEY
    );

    return response;
  } catch (error) {
    console.error("EmailJS Error:", error);
    throw error;
  }
};