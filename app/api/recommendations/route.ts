import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { parseBoundedInt } from '@/lib/validation';
import {
  recommendForQuery,
  recommendForUser,
  recommendSimilarToBook,
} from '@/lib/recommendations';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const bookId = searchParams.get('bookId')?.trim();
    const query = searchParams.get('q')?.trim();
    const limit = parseBoundedInt(searchParams.get('limit'), {
      defaultValue: 5,
      min: 1,
      max: 20,
    });

    if (bookId) {
      const books = await recommendSimilarToBook(bookId, limit);
      return NextResponse.json({ books, mode: 'similar' });
    }

    if (query) {
      const books = await recommendForQuery(query, limit);
      return NextResponse.json({ books, mode: 'query' });
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Provide bookId or q, or sign in for personalised recommendations' },
        { status: 400 }
      );
    }

    const books = await recommendForUser(session.user.id, limit);
    return NextResponse.json({ books, mode: 'user' });
  } catch (error) {
    console.error('Recommendations error:', error);
    return NextResponse.json(
      { error: 'Failed to compute recommendations' },
      { status: 500 }
    );
  }
}
