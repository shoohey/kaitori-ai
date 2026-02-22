import { Resend } from "resend";
import { prisma } from "@/lib/db";
import { NotificationPayload } from "@/types";
import { buildNotificationEmail } from "./templates";

export async function sendNotificationEmail(
  payload: NotificationPayload
): Promise<boolean> {
  const html = buildNotificationEmail(payload);

  // RESEND_API_KEY未設定時: DBにdraftとして保存しコンソール出力（デモ用）
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === "re_your-resend-api-key") {
    console.log(`[Email] RESEND_API_KEY not configured — saving as draft`);
    console.log(`[Email] To: ${payload.email}`);
    console.log(`[Email] Subject: ${payload.subject}`);
    console.log(`[Email] Properties: ${payload.properties.length} matched`);

    await prisma.notification.create({
      data: {
        email: payload.email,
        subject: payload.subject,
        body: html,
        status: "draft",
      },
    });

    return true;
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    await resend.emails.send({
      from: "買取AI <onboarding@resend.dev>",
      to: payload.email,
      subject: payload.subject,
      html,
    });

    await prisma.notification.create({
      data: {
        email: payload.email,
        subject: payload.subject,
        body: html,
        status: "sent",
      },
    });

    return true;
  } catch (error) {
    console.error("Failed to send email:", error);

    await prisma.notification.create({
      data: {
        email: payload.email,
        subject: payload.subject,
        body: `Error: ${error instanceof Error ? error.message : String(error)}`,
        status: "failed",
      },
    });

    return false;
  }
}
