import { prisma } from './prisma';
import { embed, toVectorLiteral } from './embeddings';

export interface RecommendedBook {
  id: string;
  title: string;
  author: string;
  description: string;
  coverUrl: string | null;
  distance: number;
}

export async function recommendSimilarToBook(
  bookId: string,
  limit = 5
): Promise<RecommendedBook[]> {
  const rows = await prisma.$queryRaw<RecommendedBook[]>`
    SELECT
      b.id,
      b.title,
      b.author,
      b.description,
      b."coverUrl",
      b.embedding <=> (SELECT embedding FROM "books" WHERE id = ${bookId}) AS distance
    FROM "books" b
    WHERE b.id != ${bookId}
      AND b.embedding IS NOT NULL
      AND (SELECT embedding FROM "books" WHERE id = ${bookId}) IS NOT NULL
    ORDER BY distance ASC
    LIMIT ${limit}
  `;
  return rows;
}

export async function recommendForQuery(
  query: string,
  limit = 5
): Promise<RecommendedBook[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const vector = await embed(trimmed);
  const literal = toVectorLiteral(vector);

  const rows = await prisma.$queryRawUnsafe<RecommendedBook[]>(
    `
      SELECT
        b.id,
        b.title,
        b.author,
        b.description,
        b."coverUrl",
        b.embedding <=> $1::vector AS distance
      FROM "books" b
      WHERE b.embedding IS NOT NULL
      ORDER BY distance ASC
      LIMIT $2
    `,
    literal,
    limit
  );
  return rows;
}

export async function recommendForUser(
  userId: string,
  limit = 5
): Promise<RecommendedBook[]> {
  const shelfBooks = await prisma.shelfBook.findMany({
    where: { shelf: { userId } },
    select: { bookId: true, shelf: { select: { name: true } } },
  });

  const readBookIds = shelfBooks
    .filter((sb) => sb.shelf.name === 'Read')
    .map((sb) => sb.bookId);
  if (readBookIds.length === 0) return [];

  const allShelfBookIds = shelfBooks.map((sb) => sb.bookId);

  const rows = await prisma.$queryRawUnsafe<RecommendedBook[]>(
    `
      WITH centroid AS (
        SELECT AVG(embedding)::vector AS v
        FROM "books"
        WHERE "externalId" = ANY($1::text[]) AND embedding IS NOT NULL
      )
      SELECT
        b.id,
        b.title,
        b.author,
        b.description,
        b."coverUrl",
        b.embedding <=> (SELECT v FROM centroid) AS distance
      FROM "books" b
      WHERE b.embedding IS NOT NULL
        AND NOT (b."externalId" = ANY($2::text[]))
        AND (SELECT v FROM centroid) IS NOT NULL
      ORDER BY distance ASC
      LIMIT $3
    `,
    readBookIds,
    allShelfBookIds,
    limit
  );
  return rows;
}
