import { Resend } from "resend";
import { prisma } from "@/lib/db";
import { NotificationPayload } from "@/types";
import { buildNotificationEmail } from "./templates";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendNotificationEmail(
  payload: NotificationPayload
): Promise<boolean> {
  try {
    const html = buildNotificationEmail(payload);

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
