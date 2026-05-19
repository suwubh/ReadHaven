import { prisma } from '../lib/prisma';
import { embedBatch, toVectorLiteral } from '../lib/embeddings';

const BATCH_SIZE = 16;

interface BookRow {
  id: string;
  title: string;
  author: string;
  description: string;
  subjects: string[];
}

function textFor(book: BookRow): string {
  const subjects = book.subjects.slice(0, 5).join(', ');
  return `${book.title} by ${book.author}. ${book.description}${
    subjects ? ` Subjects: ${subjects}` : ''
  }`.slice(0, 1000);
}

async function main() {
  const rows = await prisma.$queryRaw<BookRow[]>`
    SELECT id, title, author, description, subjects
    FROM "books"
    WHERE "embedding" IS NULL
    ORDER BY "createdAt" ASC
  `;

  console.log(`${rows.length} books need embeddings`);
  if (rows.length === 0) return;

  let done = 0;
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const texts = batch.map(textFor);
    const vectors = await embedBatch(texts);

    for (let j = 0; j < batch.length; j++) {
      const literal = toVectorLiteral(vectors[j]);
      await prisma.$executeRawUnsafe(
        `UPDATE "books" SET "embedding" = $1::vector, "updatedAt" = NOW() WHERE "id" = $2`,
        literal,
        batch[j].id
      );
    }

    done += batch.length;
    if (done % 100 === 0 || done === rows.length) {
      console.log(`  embedded ${done}/${rows.length}`);
    }
  }

  console.log('Done.');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
