import nodemailer from "nodemailer";
import { getBlogBySlug } from "@@/data/blogs";

function escapeHtml(value: string) {
  return value.replace(
    /[&<>'"]/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;",
      })[character] || character,
  );
}

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
}

function getRecipient() {
  return process.env.CONTACT_EMAIL || process.env.SMTP_USER;
}

function getBlogDetails(slug: string) {
  const blog = getBlogBySlug(slug);
  return {
    title: blog?.title || slug,
    url: `https://ziglacity.tech/blogs/${slug}`,
  };
}

async function sendNotification(message: {
  subject: string;
  text: string;
  html: string;
}) {
  const recipient = getRecipient();
  const sender = process.env.SMTP_USER;

  if (!recipient || !sender) {
    console.warn(
      "Blog notification skipped: SMTP recipient or sender is missing",
    );
    return;
  }

  try {
    await createTransporter().sendMail({
      from: sender,
      to: recipient,
      subject: message.subject,
      text: message.text,
      html: message.html,
    });
  } catch (error) {
    console.error("Blog notification delivery failed:", error);
  }
}

export async function notifyNewBlogComment(input: {
  slug: string;
  displayName: string | null;
  body: string;
}) {
  const blog = getBlogDetails(input.slug);
  const name = input.displayName || "Anonymous";
  const safeTitle = escapeHtml(blog.title);
  const safeName = escapeHtml(name);
  const safeBody = escapeHtml(input.body).replace(/\n/g, "<br />");

  await sendNotification({
    subject: `New blog comment: ${blog.title}`,
    text: `New comment on ${blog.title}\n\nFrom: ${name}\n\n${input.body}\n\nRead it: ${blog.url}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;color:#18181b">
        <div style="border-top:4px solid #06b6d4;padding:24px 0 16px">
          <p style="margin:0;color:#0891b2;font-size:12px;font-weight:bold;letter-spacing:2px;text-transform:uppercase">New blog activity</p>
          <h1 style="margin:10px 0 0;font-size:26px">New comment on ${safeTitle}</h1>
        </div>
        <div style="border:1px solid #e4e4e7;border-radius:12px;padding:20px">
          <p style="margin:0 0 8px;color:#71717a;font-size:13px">From</p>
          <p style="margin:0 0 20px;font-weight:bold">${safeName}</p>
          <p style="margin:0 0 8px;color:#71717a;font-size:13px">Comment</p>
          <p style="margin:0;line-height:1.7;white-space:normal">${safeBody}</p>
        </div>
        <p style="margin:20px 0"><a href="${blog.url}" style="color:#0891b2;font-weight:bold">Open the blog post</a></p>
      </div>
    `,
  });
}

export async function notifyNewBlogReaction(input: {
  slug: string;
  reactionType: string;
}) {
  const blog = getBlogDetails(input.slug);
  const safeTitle = escapeHtml(blog.title);
  const safeReaction = escapeHtml(input.reactionType);

  await sendNotification({
    subject: `New blog reaction: ${blog.title}`,
    text: `A reader reacted to ${blog.title} with: ${input.reactionType}\n\nRead it: ${blog.url}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;color:#18181b">
        <div style="border-top:4px solid #06b6d4;padding:24px 0 16px">
          <p style="margin:0;color:#0891b2;font-size:12px;font-weight:bold;letter-spacing:2px;text-transform:uppercase">New blog activity</p>
          <h1 style="margin:10px 0 0;font-size:26px">Someone reacted to ${safeTitle}</h1>
        </div>
        <div style="border:1px solid #e4e4e7;border-radius:12px;padding:20px">
          <p style="margin:0;color:#71717a;font-size:13px">Reaction</p>
          <p style="margin:8px 0 0;font-size:22px;font-weight:bold">${safeReaction}</p>
        </div>
        <p style="margin:20px 0"><a href="${blog.url}" style="color:#0891b2;font-weight:bold">Open the blog post</a></p>
      </div>
    `,
  });
}
