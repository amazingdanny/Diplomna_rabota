import { NextResponse } from "next/server";
import users from "@/data/users.json";
import jwt from "jsonwebtoken";
import {prisma} from "@/lib/prisma";

export async function POST(request: Request) {
  const { email, password } = await request.json();
  const user = await prisma.user.findFirst({
  where: {
    email: email,
    password: password
  }
})


  if (!user) {
    return NextResponse.json(
      { message: "Invalid email or password" },
      { status: 401 }
    );
  }
    const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET as string,
    { expiresIn: "1h" }
  );
    const response = NextResponse.json({success : true});

    response.cookies.set({
    name: "token",
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60, // 1 hour
    });
    return response;

}