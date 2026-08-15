import { Resend } from "resend";

export async function sendWelcomeEmail(
  email: string,
  issueUrl: string,
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from: "UNDERSOLE <onboarding@resend.dev>",
    to: email,
    subject: "You're in. Welcome to Undersole",
    html: `
      <div style="background:#121212;color:#e5e0d8;font-family:Arial,sans-serif;padding:40px 28px;line-height:1.65">
        <div style="max-width:560px;margin:0 auto">
          <p style="color:#ff4500;font-weight:700;letter-spacing:.18em;font-size:12px">UNDERSOLE / ISSUE 01</p>
          <h1 style="color:#fff;font-size:34px;letter-spacing:-.04em;margin:30px 0 18px">You're in.</h1>
          <p>Hey —</p>
          <p>You just joined Undersole, a zine about the sneaker and streetwear scene in India — the resale hustle, the customizers doing wild things in their bedrooms, the culture nobody's writing about properly.</p>
          <p>Issue #1 is live now.</p>
          <p style="margin:30px 0">
            <a href="${issueUrl}" style="color:#121212;background:#ff4500;padding:12px 16px;text-decoration:none;font-weight:700">START READING →</a>
          </p>
          <p style="color:#a9a39b">No spam, no fluff — just real coverage of a scene worth taking seriously.</p>
          <p>— The Undersole team</p>
        </div>
      </div>
    `,
  });

  if (error) {
    throw new Error(error.message);
  }
}