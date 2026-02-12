import { NextResponse } from "next/server";

import { AUTH_COOKIE_NAME } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    const isProduction = process.env.NODE_ENV === "production";
    const adminUser = process.env.ADMIN_USER ?? (isProduction ? undefined : "admin");
    const adminPass = process.env.ADMIN_PASS ?? (isProduction ? undefined : "admin123");

    if (!adminUser || !adminPass) {
      const missingKeys = ["ADMIN_USER", "ADMIN_PASS"].filter((key) => !process.env[key]);
      return NextResponse.json(
        {
          message: `Server auth environment variables are missing: ${missingKeys.join(", ")}`,
        },
        { status: 500 },
      );
    }

    if ((!process.env.ADMIN_USER || !process.env.ADMIN_PASS) && !isProduction) {
      console.warn(
        "ADMIN_USER/ADMIN_PASS are not set. Using development fallback credentials (admin/admin123).",
      );
    }

    if (username !== adminUser || password !== adminPass) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: "1",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("Login failed", error);
    return NextResponse.json({ message: "Login failed" }, { status: 500 });
  }
}
