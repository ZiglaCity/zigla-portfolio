import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: NextRequest) {
  try {
    const { name, email, message } = await request.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 },
      );
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: process.env.CONTACT_EMAIL || process.env.SMTP_USER,
      replyTo: email,
      subject: `Portfolio Contact: Message from ${name}`,
      text: `
New contact form submission:

Name: ${name}
Email: ${email}

Message:
${message}
      `,
      html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0a0a0a; color: #e5e5e5; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background-color: #111; border: 1px solid #22d3ee33; border-radius: 12px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #0891b2 0%, #22d3ee 100%); padding: 20px; text-align: center; }
    .header h1 { margin: 0; color: #0a0a0a; font-size: 24px; }
    .content { padding: 30px; }
    .field { margin-bottom: 20px; }
    .label { color: #22d3ee; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px; }
    .value { color: #e5e5e5; font-size: 16px; padding: 10px; background-color: #0a0a0a; border-radius: 6px; border-left: 3px solid #22d3ee; }
    .message-box { white-space: pre-wrap; line-height: 1.6; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; border-top: 1px solid #22d3ee33; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1> New Contact Message</h1>
    </div>
    <div class="content">
      <div class="field">
        <div class="label">From</div>
        <div class="value">${name}</div>
      </div>
      <div class="field">
        <div class="label">Email</div>
        <div class="value"><a href="mailto:${email}" style="color: #22d3ee;">${email}</a></div>
      </div>
      <div class="field">
        <div class="label">Message</div>
        <div class="value message-box">${message.replace(/\n/g, "<br>")}</div>
      </div>
    </div>
    <div class="footer">
      Sent from your portfolio contact form
    </div>
  </div>
</body>
</html>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json(
      { message: "Email sent successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 },
    );
  }
}
