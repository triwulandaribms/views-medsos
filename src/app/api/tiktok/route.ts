import { NextRequest } from "next/server";
import { getTiktokData } from "@/src/services/tikTokService";
import { ok, fail } from "@/src/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get("username");

    if (!username) {
      return fail("Username is required", 400);
    }

    const data = await getTiktokData(username);

    return ok("Success fetch TikTok data", data);
  } catch (err: any) {
    return fail(err.message || "Internal server error", 500);
  }
}