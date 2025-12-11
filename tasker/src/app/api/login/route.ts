import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import {prisma} from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  const { email, password } = await request.json();
  const user = await prisma.user.findFirst({
  where: {
    email: email
  }
})


  if (!user) {
    return NextResponse.json(
      { message: "Invalid email or password" },
      { status: 401 }
    );
  }

  // Compare the provided password with the hashed password
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return NextResponse.json(
      { message: "Invalid email or password" },
      { status: 401 }
    );
  }
    const token = jwt.sign(
    { id: user.id, email: user.email, role : user.role },
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
    maxAge: 60 * 60 * 10, // 10 hours
    });
    return response;

}