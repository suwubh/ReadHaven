# ReadHaven

A modern, full-stack reading management and social platform built with Next.js 16, where book lovers can discover, track, and share their reading journey.

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791)

## 🌟 Features

### 📚 Book Management
- **Comprehensive Book Search**: Search through millions of books using Google Books and Open Library APIs
- **Personal Shelves**: Organize books into default shelves (Want to Read, Currently Reading, Read) or create custom collections
- **Reading Progress**: Track your reading journey with detailed statistics and progress indicators
- **Book Details**: View comprehensive information including ratings, reviews, descriptions, and metadata

### ⭐ Reviews & Ratings
- **Rate & Review**: Share your thoughts with 1-5 star ratings and detailed reviews
- **Edit & Delete**: Manage your reviews with full CRUD functionality
- **Personal Review Gallery**: View all your reviews in one organized place

### 🎯 Reading Goals
- **Annual Challenges**: Set and track yearly reading goals
- **Progress Tracking**: Visual progress bars and statistics to keep you motivated
- **Historical Data**: View past years' achievements and goals
- **Quick Goal Setting**: Choose from popular goal presets (12, 24, 50, 100 books)

### 📊 Reading Statistics
- **Comprehensive Analytics**: 
  - Total books read
  - Books read by year and month
  - Average ratings and rating distribution
  - Reading pace and trends
- **Visual Charts**: Interactive bar charts and progress indicators
- **Reading Insights**: Discover your most productive months and reading patterns

### 👥 Social Features
- **Friend System**: 
  - Search and connect with friends by email
  - Send, accept, or decline friend requests
  - View friends' reading activities
- **Community Feed**: 
  - Share thoughts and reviews as posts
  - Attach books to your posts
  - Like and comment on posts
  - Real-time activity feed
- **Activity Tracking**: See what your friends are reading and reviewing

### 🎨 User Experience
- **Beautiful UI**: Modern, responsive design with gradient themes and smooth animations
- **Profile Customization**: Edit bio, location, website, and personal information
- **Quick Navigation**: Intuitive sidebar with shelves, statistics, and quick links
- **Search Integration**: Instant book search with detailed results

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Custom CSS with responsive design
- **Authentication UI**: NextAuth.js components
- **Icons**: Font Awesome 5

### Backend
- **Runtime**: Node.js
- **Framework**: Next.js API Routes
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Authentication**: NextAuth.js
  - Credentials provider (email/password)
  - Google OAuth provider

### External APIs
- **Google Books API**: Primary book data source
- **Open Library API**: Secondary book data source with fallback

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL (v14 or higher)
- Git

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/suwubh/ReadHaven.git
cd ReadHaven
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Setup

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/readhaven"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Google OAuth (optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 4. Database Setup

Initialize the database and run migrations:

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# (Optional) Seed the database
npx prisma db seed
```

### 5. Run Development Server

```bash
npm run dev
# or
yarn dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 📁 Project Structure

```
ReadHaven/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication pages
│   │   ├── login/
│   │   └── signup/
│   ├── api/                      # API routes
│   │   ├── auth/                 # NextAuth & registration
│   │   ├── books/                # Book search & details
│   │   ├── friends/              # Friend management
│   │   ├── posts/                # Social posts
│   │   ├── reading-goal/         # Reading challenges
│   │   ├── reviews/              # Book reviews
│   │   ├── shelves/              # Shelf management
│   │   └── user/                 # User profile
│   ├── book/[id]/                # Book detail pages
│   ├── components/               # Reusable components
│   ├── create-post/              # Post creation
│   ├── feed/                     # Social feed
│   ├── friends/                  # Friends page
│   ├── profile/                  # User profile
│   ├── reading-challenge/        # Reading goals
│   ├── reviews/                  # User reviews
│   ├── search/                   # Book search
│   ├── shelf/[name]/             # Shelf pages
│   ├── statistics/               # Reading stats
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page
├── lib/                          # Utility libraries
│   ├── auth.ts                   # NextAuth configuration
│   └── prisma.ts                 # Prisma client
├── prisma/                       # Database schema & migrations
│   ├── migrations/
│   └── schema.prisma
├── types/                        # TypeScript type definitions
├── public/                       # Static assets
│   └── images/
├── .env                          # Environment variables
├── .gitignore
├── next.config.js
├── package.json
├── tsconfig.json
└── README.md
```

## 🗄️ Database Schema

### Core Models
- **User**: User accounts with authentication
- **Shelf**: Personal book collections
- **ShelfBook**: Books in shelves with metadata
- **Review**: User ratings and reviews
- **ReadingGoal**: Annual reading challenges
- **Friendship**: Friend connections
- **Post**: Social media posts
- **Like**: Post likes
- **Comment**: Post comments
- **Activity**: User activity tracking

See `prisma/schema.prisma` for the complete schema.

## 🔐 Authentication

ReadHaven supports multiple authentication methods:

1. **Email/Password**: Traditional credentials-based authentication
2. **Google OAuth**: Sign in with Google account

New users automatically get three default shelves:
- Want to Read
- Currently Reading
- Read

## 🎨 Key Features Implementation

### Book Search
- Dual API integration (Google Books + Open Library)
- Automatic fallback between sources
- Result merging and deduplication
- Pagination support

### Shelves System
- Default and custom shelves
- Books can exist on multiple shelves
- Add/remove books with one click
- Sort by date, title, or author

### Social Feed
- Create posts with optional book attachments
- Like and comment functionality
- Real-time activity updates
- Friend-based content filtering

### Statistics Dashboard
- Monthly reading charts
- Rating distribution graphs
- Year-over-year comparisons
- Reading insights and patterns

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project to Vercel
3. Configure environment variables
4. Deploy

### Environment Variables for Production

```env
DATABASE_URL="your-production-database-url"
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="your-production-secret"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### Database Migration

```bash
npx prisma migrate deploy
```

## 📱 Responsive Design

ReadHaven is fully responsive with breakpoints:
- Mobile: < 480px
- Tablet: 481px - 768px
- Desktop: 769px - 1200px
- Large Desktop: > 1200px

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Run type checking
npx tsc --noEmit

# Lint code
npm run lint
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Coding Standards
- Use TypeScript for all new files
- Follow existing code style and conventions
- Write meaningful commit messages
- Add comments for complex logic

## 📝 API Documentation

### Book Search
```
GET /api/books/search?q={query}&page={page}
```

### Book Details
```
GET /api/books/{id}
```

### User Reviews
```
GET /api/reviews?bookId={bookId}
POST /api/reviews
DELETE /api/reviews
```

### Reading Goals
```
GET /api/reading-goal?year={year}
POST /api/reading-goal
```

## 🐛 Known Issues

- Image loading may be slow for books without cached thumbnails
- Google Books API has rate limits (use with moderation)
- OAuth requires production domain for full functionality

## 🔮 Future Enhancements

- [ ] Mobile app (React Native)
- [ ] Book recommendations engine
- [ ] Reading groups and clubs
- [ ] Import/export reading data
- [ ] Goodreads integration
- [ ] Dark mode
- [ ] Multi-language support
- [ ] Book notes and highlights
- [ ] Reading streaks and achievements
- [ ] Advanced search filters

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**suwubh**
- GitHub: [@suwubh](https://github.com/suwubh)
- Project Link: [https://github.com/suwubh/ReadHaven](https://github.com/suwubh/ReadHaven)

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework
- [Prisma](https://www.prisma.io/) - Next-generation ORM
- [NextAuth.js](https://next-auth.js.org/) - Authentication
- [Google Books API](https://developers.google.com/books) - Book data
- [Open Library API](https://openlibrary.org/developers/api) - Additional book data
- [Font Awesome](https://fontawesome.com/) - Icon library

## 📞 Support

For support, please open an issue in the GitHub repository.

---

**Made with ❤️ for book lovers everywhere**
