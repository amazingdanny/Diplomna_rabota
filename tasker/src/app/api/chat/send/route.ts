import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let userId: string;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
      userId = decoded.id;
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { groupId, content, userId: requestUserId } = await request.json();
    const effectiveUserId = requestUserId || userId;

    if (!groupId || !content) {
      return NextResponse.json({ error: 'groupId and content are required' }, { status: 400 });
    }

    const membership = await prisma.chatGroupMember.findFirst({
      where: {
        groupId: groupId,
        userId: effectiveUserId,
      },
    });

    if (!membership) {
      return NextResponse.json({ error: 'User is not a member of this group' }, { status: 403 });
    }

    const message = await prisma.message.create({
      data: {
        content: content,
        senderId: effectiveUserId,
        groupId: groupId,
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        group: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}