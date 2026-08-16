/// <reference lib="dom" />

const N8N_WEBHOOK_URL =
  "https://ramana1.app.n8n.cloud/webhook/undersole-welcome-email";

export async function sendWelcomeEmail(
  email: string,
  _issueUrl: string,
): Promise<string> {
  const webhookSecret = process.env.UNDERSOLE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new Error("UNDERSOLE_WEBHOOK_SECRET is not configured");
  }

  console.info("Sending welcome email to n8n webhook", {
    method: "POST",
    url: N8N_WEBHOOK_URL,
    email,
    headers: ["Content-Type", "x-webhook-secret"],
    body: { email },
  });

  const response = (await fetch(N8N_WEBHOOK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-webhook-secret": webhookSecret,
    },
    body: JSON.stringify({ email }),
  })) as Response;
  const responseBody = await response.text();

  console.info("n8n welcome email webhook response", {
    status: response.status,
    ok: response.ok,
    body: responseBody,
  });

  if (!response.ok) {
    throw new Error(
      `n8n webhook returned HTTP ${response.status}: ${responseBody}`,
    );
  }

  let parsedBody: unknown;
  try {
    parsedBody = JSON.parse(responseBody);
  } catch {
    throw new Error(`n8n webhook returned invalid JSON: ${responseBody}`);
  }

  if (
    !parsedBody ||
    typeof parsedBody !== "object" ||
    !("success" in parsedBody) ||
    parsedBody.success !== true
  ) {
    throw new Error(`n8n webhook reported failure: ${responseBody}`);
  }

  return responseBody;
}
