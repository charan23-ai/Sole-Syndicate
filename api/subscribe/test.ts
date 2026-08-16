import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  RunSubscriptionTestBody,
  RunSubscriptionTestResponse,
} from "@workspace/api-zod";
import { sendWelcomeEmail } from "../_lib/email";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const adminPass = process.env.ADMIN_PASS;
  const adminHeader = req.headers["x-admin-pass"];
  if (!adminPass || adminHeader !== adminPass) {
    return res.status(401).json({ error: "Unauthorized." });
  }

  const parsed = RunSubscriptionTestBody.safeParse(req.body ?? {});
  if (!parsed.success) {
    return res.status(400).json({ error: "Enter a valid test email address." });
  }

  const email = parsed.data.email.trim().toLowerCase();
  if (!emailPattern.test(email)) {
    return res.status(400).json({ error: "Enter a valid test email address." });
  }

  try {
    const host = req.headers["x-forwarded-host"] || req.headers.host || "undersole.in";
    const proto = req.headers["x-forwarded-proto"] || "https";
    const origin = `${proto}://${host}`;

    const n8nResponse = await sendWelcomeEmail(email, `${origin}/issue-1`);
    console.info("Subscription test email sent via n8n", { email, n8nResponse });
    const response = RunSubscriptionTestResponse.parse({
      success: true,
      emailSent: true,
      message: `Welcome email sent to ${email}.`,
    });
    return res.status(200).json(response);
  } catch (error) {
    console.error("Subscription test email failed", { email, err: error });
    const response = RunSubscriptionTestResponse.parse({
      success: false,
      emailSent: false,
      message: "The welcome email could not be sent.",
    });
    return res.status(502).json(response);
  }
}
