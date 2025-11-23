// backend/services/notifyService.js
import nodemailer from "nodemailer";

export async function sendNotification({ to, subject, message }) {
  try {
    // ✅ Create transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // ✅ Define mail content
    const mailOptions = {
      from: `"S.V PG Hostel" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text: message,
      html: `<div style="font-family: Arial, sans-serif;">
              <h3>🏠 S.V PG Hostel Booking Confirmed</h3>
              <p>${message.replace(/\n/g, "<br>")}</p>
              <hr>
              <small>Thank you for staying with S.V PG Hostel Gents.</small>
            </div>`,
    };

    // ✅ Send the mail
    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent: ${info.messageId}`);
    return { success: true, id: info.messageId };
  } catch (err) {
    console.error("❌ Email send error:", err.message);
    return { success: false, message: err.message };
  }
}
