import { Router, type IRouter } from "express";
import { count, eq } from "drizzle-orm";
import { db, subscribersTable } from "@workspace/db";
import {
  GetSubscriberCountResponse,
  RunSubscriptionTestBody,
  RunSubscriptionTestResponse,
  SubscribeToNewsletterBody,
  SubscribeToNewsletterResponse,
} from "@workspace/api-zod";
import { sendWelcomeEmail } from "../lib/email";

const router: IRouter = Router();
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function getSubscriberTotal(): Promise<number> {
  const [result] = await db.select({ count: count() }).from(subscribersTable);
  return Number(result?.count ?? 0);
}

router.get("/subscribers/count", async (_req, res): Promise<void> => {
  const response = GetSubscriberCountResponse.parse({
    count: await getSubscriberTotal(),
  });
  res.json(response);
});

router.post("/subscribe", async (req, res): Promise<void> => {
  const parsed = SubscribeToNewsletterBody.safeParse(req.body);
  if (!parsed.success || !emailPattern.test(parsed.data?.email ?? "")) {
    res.status(400).json({ error: "Enter a valid email address." });
    return;
  }

  const email = parsed.data.email.trim().toLowerCase();
  const [existing] = await db
    .select({ id: subscribersTable.id })
    .from(subscribersTable)
    .where(eq(subscribersTable.email, email))
    .limit(1);

  if (existing) {
    const response = SubscribeToNewsletterResponse.parse({
      success: true,
      message: "You're already in the crew.",
      subscriberCount: await getSubscriberTotal(),
    });
    res.json(response);
    return;
  }

  await db.insert(subscribersTable).values({
    email,
    source: "newsletter_form",
  });

  try {
    const origin = `${req.protocol}://${req.get("host")}`;
    await sendWelcomeEmail(email, `${origin}/issue-1`);
  } catch (error) {
    req.log.error({ err: error, email }, "Welcome email failed after subscription");
  }

  const response = SubscribeToNewsletterResponse.parse({
    success: true,
    message: "You're in. Check your email.",
    subscriberCount: await getSubscriberTotal(),
  });
  res.json(response);
});

router.post("/subscribe/test", async (req, res): Promise<void> => {
  const adminPass = process.env.ADMIN_PASS;
  if (!adminPass || req.get("x-admin-pass") !== adminPass) {
    res.status(401).json({ error: "Unauthorized." });
    return;
  }

  const parsed = RunSubscriptionTestBody.safeParse(req.body ?? {});
  if (!parsed.success) {
    res.status(400).json({ error: "Enter a valid test email address." });
    return;
  }

  const email = parsed.data.email.trim().toLowerCase();
  if (!emailPattern.test(email)) {
    res.status(400).json({ error: "Enter a valid test email address." });
    return;
  }

  try {
    const origin = `${req.protocol}://${req.get("host")}`;
    const n8nResponse = await sendWelcomeEmail(email, `${origin}/issue-1`);
    req.log.info(
      { email, n8nResponse },
      "Subscription test email sent via n8n",
    );
    res.json(
      RunSubscriptionTestResponse.parse({
        success: true,
        emailSent: true,
        message: `Welcome email sent to ${email}.`,
      }),
    );
  } catch (error) {
    req.log.error({ err: error, email }, "Subscription test email failed");
    res.status(502).json(
      RunSubscriptionTestResponse.parse({
        success: false,
        emailSent: false,
        message: "The welcome email could not be sent.",
      }),
    );
  }
});

export default router;