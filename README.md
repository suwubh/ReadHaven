# ReadHaven

A reading-tracker web app built with Next.js. Users can search books, organize
them into shelves, log reviews and ratings, set a yearly reading goal, add
friends, and share short posts with the community.


## Tech stack

- **Next.js 16** (App Router, server components, route handlers)
- **TypeScript**
- **PostgreSQL** with **Prisma** as the ORM
- **NextAuth.js** for authentication (email/password, Google, GitHub)
- **Tailwind CSS** + a few hand-written stylesheets per page
- **Zod** for request validation
- External book data: **Google Books API** and **Open Library API**
- Optional: **Groq API** (LLM) for "Awards" category recommendations

## Features

- **Auth**: sign up with email/password (bcrypt-hashed), or OAuth via Google /
  GitHub. JWT sessions.
- **Book search**: queries Google Books and Open Library in parallel, dedupes
  by title + first author, then ranks by ratings/recency.
- **Book detail page**: aggregates fields from both sources, sanitizes the
  description HTML, and shows existing reviews.
- **Shelves**: every new user gets *Want to Read*, *Currently Reading* and
  *Read* shelves bootstrapped in a Prisma transaction.
- **Reviews**: 1–5 star rating with optional text. Editing a review upserts
  the existing row instead of creating duplicates.
- **Reading goal**: one yearly goal per user (`@@unique([userId, year])`),
  with progress shown on the home page.
- **Friends**: search by email, send / accept / remove requests.
- **Posts & comments**: short posts (max 2000 chars) optionally attached to a
  book, with like-toggle and cursor-paginated comments.
- **Awards section** *(optional)*: asks Groq for 5 book titles in a category,
  then resolves each through the book search/detail APIs.

## Project layout

```
app/
  (auth)/           login & signup pages
  api/              route handlers (books, reviews, shelves, posts, friends, …)
  book/             book detail + a /book/resolve helper that finds a book by title+author
  feed/             social feed and post detail
  friends/          friends search + request list
  profile/          profile view and edit
  reading-challenge/  yearly goal
  reviews/          all the user's reviews
  search/           book search page
  shelf/[name]/     books in a single shelf
  statistics/       reading stats
  components/       shared client/server components
  styles/globals/   per-page stylesheets imported from globals.css
lib/
  auth.ts           NextAuth config
  prisma.ts         Prisma client singleton
  shelves.ts        default-shelf bootstrap helper
  shelf-slug.ts     URL slug helpers for shelves
  validation.ts     pagination + zod helpers
prisma/
  schema.prisma     models: User, Post, Like, Comment, Friendship, Activity,
                    Shelf, ShelfBook, Review, ReadingGoal, plus NextAuth tables
```

## Setup

Requires Node 18+ and a PostgreSQL database (Neon, Supabase, or local).

```bash
git clone https://github.com/suwubh/ReadHaven.git
cd ReadHaven
npm install
```

Create `.env` in the project root:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DB?sslmode=require"

NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="<output of: openssl rand -base64 32>"

# Optional OAuth providers
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""

# Optional — enables the LLM-powered Awards category recommendations
GROQ_API_KEY=""
```

Then run the migrations and start the dev server:

```bash
npx prisma migrate deploy
npm run dev
```

App runs at <http://localhost:3000>.

## Useful scripts

- `npm run dev` — Next.js dev server
- `npm run build` — production build
- `npm run start` — start the built app
- `npm run lint` — ESLint (currently warnings only — uses `<img>` for some
  legacy markup paths)
- `npx tsc --noEmit` — type check

## API surface (summary)

| Method | Path | Notes |
| --- | --- | --- |
| `POST` | `/api/auth/register` | name, email, password (8–72 bytes) |
| `GET` | `/api/books/search?q=&page=` | merged Google + Open Library |
| `GET` | `/api/books/[id]` | merged detail (Google ID or `OL…` ID) |
| `GET`/`POST`/`DELETE` | `/api/reviews` | list by `bookId`; upsert / delete by id |
| `POST` | `/api/shelves/add-book` | requires auth; checks shelf ownership |
| `POST` | `/api/shelves/remove-book` | requires auth |
| `GET`/`POST` | `/api/reading-goal?year=` | one goal per `(userId, year)` |
| `GET`/`POST` | `/api/posts` | list recent / create a post |
| `POST` | `/api/posts/like` | toggle like |
| `GET`/`POST` | `/api/posts/[id]/comments` | cursor paginated |
| `GET` | `/api/friends/search?email=` | find a user to friend |
| `POST` | `/api/friends/request` `/accept` `/remove` | manage friendships |
| `PATCH` | `/api/user/profile` | name, bio, location, website |
| `POST` | `/api/awards` | category → LLM → resolved books |

## Notes & known limitations

- This is a single-developer learning project — there are no automated tests
  yet. Behaviour is verified manually.
- The hero / footer / discover sections are static, intentionally — they're
  the landing UI rather than fully data-backed views.
- Activity tracking (`Activity` model) is wired in the schema but not yet
  written by the rest of the app.
- OAuth callbacks need the corresponding `NEXTAUTH_URL` and provider redirect
  URIs to match.

## License

MIT.
