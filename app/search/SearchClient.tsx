// app/search/SearchClient.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Book {
  id: string;
  title: string;
  authors: string[];
  description: string;
  thumbnail: string;
  averageRating: number;
  ratingsCount: number;
  publishedDate: string;
}

export default function SearchClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchInput, setSearchInput] = useState(query);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    // if query changes (from URL), reset input and fetch first page
    setSearchInput(query);
    if (query) {
      searchBooks(query, 1);
    } else {
      setBooks([]);
      setHasMore(false);
      setCurrentPage(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const searchBooks = async (searchQuery: string, page: number) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        `/api/books/search?q=${encodeURIComponent(searchQuery)}&page=${page}`
      );

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      setBooks(data.books ?? []);
      setHasMore(Boolean(data.hasMore));
      setCurrentPage(page);
    } catch (err) {
      setError('Failed to search books. Please try again.');
      setBooks([]);
      setHasMore(false);
      setCurrentPage(1);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchInput.trim();
    if (trimmed) {
      // push new url so useSearchParams picks it up
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1) return;
    searchBooks(query, newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="search-page">
      <div className="search-header">
        <Link href="/" className="back-home">
          ← Back to Home
        </Link>
        <h1>Search Books</h1>
        <form onSubmit={handleSearch} className="search-form" role="search">
          <input
            aria-label="Search books"
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by title, author, or ISBN..."
            className="search-input-large"
          />
          <button type="submit" className="search-btn">
            🔍 Search
          </button>
        </form>
      </div>

      <div className="search-results-container">
        {loading && (
          <div className="loading-spinner" aria-live="polite">
            <span>🔄 Searching...</span>
          </div>
        )}

        {error && (
          <div className="error-message" role="alert">
            <span>⚠️ {error}</span>
          </div>
        )}

        {!loading && !error && query && books.length === 0 && (
          <div className="no-results">
            <div className="no-results-icon">📚</div>
            <h3>No books found for "{query}"</h3>
            <p>Try different keywords or check your spelling</p>
          </div>
        )}

        {!loading && books.length > 0 && (
          <>
            <div className="results-header">
              <h2>Results for "{query}"</h2>
              <p className="results-count">{books.length} books found</p>
            </div>

            <div className="books-grid">
              {books.map((book) => (
                <div key={book.id} className="book-card">
                  <Link href={`/book/${book.id}`}>
                    <div className="book-cover">
                      <img
                        src={book.thumbnail}
                        alt={book.title}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/images/no-cover.jpg';
                        }}
                      />
                    </div>
                  </Link>

                  <div className="book-info">
                    <Link href={`/book/${book.id}`} className="book-title">
                      {book.title}
                    </Link>

                    <p className="book-authors">by {book.authors.join(', ')}</p>

                    {book.averageRating > 0 && (
                      <div className="book-rating">
                        <div className="stars" aria-hidden>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <i
                              key={star}
                              className={`fas fa-star ${star <= Math.round(book.averageRating) ? 'filled' : ''
                                }`}
                            />
                          ))}
                        </div>
                        <span className="rating-text">
                          {book.averageRating.toFixed(1)} ({book.ratingsCount})
                        </span>
                      </div>
                    )}

                    <p className="book-description">
                      {book.description ? book.description.substring(0, 150) : ''}
                      {book.description && book.description.length > 150 ? '...' : ''}
                    </p>

                    {book.publishedDate && (
                      <p className="book-published">
                        Published: {new Date(book.publishedDate).getFullYear()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {(currentPage > 1 || hasMore) && (
              <div className="pagination">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="page-btn"
                >
                  ← Previous
                </button>
                <span className="page-info">Page {currentPage}</span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!hasMore}
                  className="page-btn"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
