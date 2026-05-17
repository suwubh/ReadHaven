import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const postId =
      body && typeof (body as { postId?: unknown }).postId === 'string'
        ? (body as { postId: string }).postId
        : null;

    if (!postId) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    const existing = await prisma.like.findUnique({
      where: { userId_postId: { userId: session.user.id, postId } },
      select: { id: true },
    });

    if (existing) {
      await prisma.like.delete({ where: { id: existing.id } });
      return NextResponse.json({ liked: false });
    }

    await prisma.like.create({
      data: { userId: session.user.id, postId },
    });
    return NextResponse.json({ liked: true });
  } catch (error) {
    console.error('Like error:', error);
    return NextResponse.json({ error: 'Failed to toggle like' }, { status: 500 });
  }
}
