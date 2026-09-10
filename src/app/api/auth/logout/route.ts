import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE } from "@/lib/server-api";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
  return new Response(null, { status: 204 });
}
