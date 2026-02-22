import { NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";

export const runtime = "nodejs";

const contactSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email().max(200),
  subject: z.string().min(1).max(150),
  message: z.string().min(1).max(2000),
  website: z.string().optional().default(""),
  startedAt: z.number().int().optional(),
});

export async function POST(request: Request) {
  try {
    const payload = await request.json().catch(() => null);
    if (!payload) {
      return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });
    }

    const parsed = contactSchema.safeParse(payload);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });
    }

    const { name, email, subject, message, website, startedAt } = parsed.data;
    const isHoneypot = Boolean(website && website.trim().length > 0);
    const isTooFast =
      typeof startedAt === "number" && Date.now() - startedAt < 2000;

    if (isHoneypot || isTooFast) {
      return NextResponse.json({ ok: true });
    }

    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.CONTACT_FROM_EMAIL;
    const to = process.env.CONTACT_TO_EMAIL || "pookie.crafts909@gmail.com";

    if (!apiKey || !from) {
      return NextResponse.json(
        { ok: false, error: "misconfigured" },
        { status: 500 }
      );
    }

    const resend = new Resend(apiKey);
    const subjectLine = `[PookieCrafts] ${subject}`;
    const text = [
      `Name: ${name}`,
      `Email: ${email}`,
      "",
      "Message:",
      message,
    ].join("\n");

    await resend.emails.send({
      from,
      to,
      replyTo: email,
      subject: subjectLine,
      text,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, error: "send_failed" },
      { status: 500 }
    );
  }
}
