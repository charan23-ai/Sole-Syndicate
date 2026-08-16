import { eq } from "drizzle-orm";
import { db, subscribersTable } from "@workspace/db";
import { SubscribeToNewsletterBody, SubscribeToNewsletterResponse, } from "@workspace/api-zod";
import { sendWelcomeEmail } from "./_lib/email";
import { getSubscriberTotal } from "./subscribers/count";
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }
    const parsed = SubscribeToNewsletterBody.safeParse(req.body);
    if (!parsed.success || !emailPattern.test(parsed.data?.email ?? "")) {
        return res.status(400).json({ error: "Enter a valid email address." });
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
        return res.status(200).json(response);
    }
    await db.insert(subscribersTable).values({
        email,
        source: "newsletter_form",
    });
    try {
        const host = req.headers["x-forwarded-host"] || req.headers.host || "undersole.in";
        const proto = req.headers["x-forwarded-proto"] || "https";
        const origin = `${proto}://${host}`;
        await sendWelcomeEmail(email, `${origin}/issue-1`);
    }
    catch (error) {
        console.error("Welcome email failed after subscription", { err: error, email });
    }
    const response = SubscribeToNewsletterResponse.parse({
        success: true,
        message: "You're in. Check your email.",
        subscriberCount: await getSubscriberTotal(),
    });
    return res.status(200).json(response);
}
