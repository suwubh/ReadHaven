// app/reviews/ReviewsPageClient.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User } from 'next-auth';

interface Review {
  id: string;
  bookId: string;
  rating: number;
  content: string | null;
  createdAt: Date;
}

interface BookData {
  [bookId: string]: {
    title: string;
    authors: string[];
    thumbnail: string;
  };
}

interface Props {
  reviews: Review[];
  user: User;
}

export default function ReviewsPageClient({ reviews, user }: Props) {
  const router = useRouter();
  const [bookData, setBookData] = useState<BookData>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBookData() {
      const data: BookData = {};

      for (const review of reviews) {
        try {
          const response = await fetch(`/api/books/${review.bookId}`);
          if (response.ok) {
            const book = await response.json();
            data[review.bookId] = {
              title: book.title,
              authors: book.authors,
              thumbnail: book.thumbnail,
            };
          }
        } catch (error) {
          console.error('Error fetching book:', error);
        }
      }

      setBookData(data);
      setLoading(false);
    }

    if (reviews.length > 0) {
      fetchBookData();
    } else {
      setLoading(false);
    }
  }, [reviews]);

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Delete this review?')) return;

    try {
      const response = await fetch('/api/reviews', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId }),
      });

      if (response.ok) {
        router.refresh();
      } else {
        alert('Failed to delete review');
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Failed to delete review');
    }
  };

  return (
    <div className="reviews-page">
      <div className="reviews-header">
        <Link href="/" className="back-home">
          ← Back to Home
        </Link>
        <div className="reviews-title-section">
          <h1>My Reviews</h1>
          <p className="reviews-count">{reviews.length} reviews</p>
        </div>
      </div>

      {loading ? (
        <div className="loading-spinner">
          <i className="fas fa-spinner fa-spin"></i> Loading reviews...
        </div>
      ) : reviews.length === 0 ? (
        <div className="empty-reviews">
          <i className="fas fa-star"></i>
          <h3>You haven't reviewed any books yet</h3>
          <p>Start reading and share your thoughts!</p>
          <Link href="/search" className="browse-books-btn">
            Browse Books
          </Link>
        </div>
      ) : (
        <div className="reviews-list">
          {reviews.map((review) => {
            const book = bookData[review.bookId];
            if (!book) return null;

            return (
              <div key={review.id} className="review-card">
                <Link href={`/book/${review.bookId}`} className="review-book-cover">
                  <img
                    src={book.thumbnail}
                    alt={book.title}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/no-cover.jpg';
                    }}
                  />
                </Link>

                <div className="review-content">
                  <Link href={`/book/${review.bookId}`} className="review-book-title">
                    {book.title}
                  </Link>
                  <p className="review-book-authors">
                    by {book.authors.join(', ')}
                  </p>

                  <div className="review-rating">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <i
                        key={star}
                        className={`fas fa-star ${
                          star <= review.rating ? 'filled' : ''
                        }`}
                      ></i>
                    ))}
                    <span className="review-date">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {review.content && (
                    <p className="review-text">{review.content}</p>
                  )}

                  <div className="review-actions">
                    <Link href={`/book/${review.bookId}`} className="edit-review-btn">
                      <i className="fas fa-edit"></i> Edit
                    </Link>
                    <button
                      onClick={() => handleDeleteReview(review.id)}
                      className="delete-review-btn"
                    >
                      <i className="fas fa-trash"></i> Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}