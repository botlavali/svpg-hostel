// backend/services/emailService.js
import nodemailer from "nodemailer";

export async function sendEmail({ to, subject, message }) {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error("Missing email credentials in .env");
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"S.V PG Hostel" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>🏠 S.V PG Hostel Booking Confirmation</h2>
          <p>${message.replace(/\n/g, "<br>")}</p>
          <hr>
          <p style="font-size: 13px; color: #666;">
            This is an automated message from S.V PG Hostel Gents.
          </p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("📧 Email sent:", info.response);
    return { success: true };
  } catch (err) {
    console.error("❌ Email send error:", err.message);
    return { success: false, message: err.message };
  }
}
