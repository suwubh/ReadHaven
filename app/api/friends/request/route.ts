// app/api/friends/request/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { friendId } = body;

    if (!friendId) {
      return NextResponse.json(
        { error: 'Friend ID is required' },
        { status: 400 }
      );
    }

    // Check if friendship already exists
    const existing = await prisma.friendship.findFirst({
      where: {
        OR: [
          { userId: session.user.id, friendId },
          { userId: friendId, friendId: session.user.id },
        ],
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Friendship already exists or pending' },
        { status: 400 }
      );
    }

    // Create friendship request
    const friendship = await prisma.friendship.create({
      data: {
        userId: session.user.id,
        friendId,
        status: 'pending',
      },
    });

    return NextResponse.json(friendship, { status: 201 });
  } catch (error) {
    console.error('Friend request error:', error);
    return NextResponse.json(
      { error: 'Failed to send friend request' },
      { status: 500 }
    );
  }
}