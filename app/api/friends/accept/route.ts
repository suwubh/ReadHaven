// app/api/friends/accept/route.ts

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
    const { friendshipId } = body;

    if (!friendshipId) {
      return NextResponse.json(
        { error: 'Friendship ID is required' },
        { status: 400 }
      );
    }

    // Verify the friendship exists and is pending
    const friendship = await prisma.friendship.findUnique({
      where: { id: friendshipId },
    });

    if (!friendship || friendship.friendId !== session.user.id) {
      return NextResponse.json(
        { error: 'Friendship not found or unauthorized' },
        { status: 404 }
      );
    }

    // Accept the friendship
    const updated = await prisma.friendship.update({
      where: { id: friendshipId },
      data: { status: 'accepted' },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Accept friend error:', error);
    return NextResponse.json(
      { error: 'Failed to accept friend request' },
      { status: 500 }
    );
  }
}