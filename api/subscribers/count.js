import { count } from "drizzle-orm";
import { db, subscribersTable } from "@workspace/db";
import { GetSubscriberCountResponse } from "@workspace/api-zod";
export async function getSubscriberTotal() {
    const [result] = await db.select({ count: count() }).from(subscribersTable);
    return Number(result?.count ?? 0);
}
export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed" });
    }
    try {
        const total = await getSubscriberTotal();
        const response = GetSubscriberCountResponse.parse({
            count: total,
        });
        return res.status(200).json(response);
    }
    catch (error) {
        console.error("Error getting subscriber count:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}
