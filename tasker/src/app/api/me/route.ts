import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const token = (await cookies()).get("token")?.value;

  if (!token) {
    return NextResponse.json(
      { success: false, message: "No token provided" },
      { status: 401 }
    );
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    );

    return NextResponse.json({
      success: true,
      user: decoded
    });
  } catch (error) {
    const response = NextResponse.json(
      { success: false, message: "Token expired" },
      { status: 401 }
    );
    response.cookies.set("token", "", { maxAge: 0 });
    return response;
  }
}
