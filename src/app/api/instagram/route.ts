import { NextRequest } from "next/server";
import { getInstagramData } from "@/src/services/instagramService";
import { ok, fail } from "@/src/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get("username");

    if (!username) return fail("Username required", 400);

    const data = await getInstagramData(username);

    return ok("Success", data);
  } catch (err: any) {
    return fail(err.message);
  }
}