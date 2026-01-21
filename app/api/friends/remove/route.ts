// app/api/friends/remove/route.ts

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

    // Verify the friendship involves the current user
    const friendship = await prisma.friendship.findUnique({
      where: { id: friendshipId },
    });

    if (
      !friendship ||
      (friendship.userId !== session.user.id && friendship.friendId !== session.user.id)
    ) {
      return NextResponse.json(
        { error: 'Friendship not found or unauthorized' },
        { status: 404 }
      );
    }

    // Delete the friendship
    await prisma.friendship.delete({
      where: { id: friendshipId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Remove friend error:', error);
    return NextResponse.json(
      { error: 'Failed to remove friend' },
      { status: 500 }
    );
  }
}