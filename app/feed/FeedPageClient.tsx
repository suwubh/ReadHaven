// app/feed/FeedPageClient.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Post {
  id: string;
  content: string;
  bookTitle: string | null;
  bookCover: string | null;
  bookAuthors: string | null;
  createdAt: Date;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
  likes: { id: string; userId: string }[];
  comments: { id: string }[];
}

interface Props {
  posts: Post[];
  currentUserId?: string;
}

export default function FeedPageClient({ posts, currentUserId }: Props) {
  const router = useRouter();
  const [liking, setLiking] = useState<string | null>(null);

  const handleLike = async (postId: string) => {
    if (!currentUserId) {
      router.push('/login');
      return;
    }

    setLiking(postId);
    try {
      const response = await fetch('/api/posts/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId }),
      });

      if (response.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error('Like error:', error);
    } finally {
      setLiking(null);
    }
  };

  const isLiked = (post: Post) => {
    return post.likes.some(like => like.userId === currentUserId);
  };

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className="feed-page">
      <div className="feed-page-header">
        <Link href="/" className="back-home">
          ← Back to Home
        </Link>
        <h1>Book Feed</h1>
        {currentUserId && (
          <Link href="/create-post" className="create-post-header-btn">
            <i className="fas fa-plus"></i>
            Create Post
          </Link>
        )}
      </div>

      <div className="feed-page-container">
        {posts.length === 0 ? (
          <div className="empty-feed-page">
            <i className="fas fa-book-open"></i>
            <h3>No posts yet</h3>
            <p>Be the first to share your thoughts about a book!</p>
            {currentUserId && (
              <Link href="/create-post" className="create-first-post-btn">
                Create First Post
              </Link>
            )}
          </div>
        ) : (
          <div className="feed-posts-list">
            {posts.map((post) => (
              <div key={post.id} className="feed-post-full">
                <div className="post-header-full">
                  <div className="post-user-info-full">
                    <div className="post-avatar-full">
                      {post.user.image ? (
                        <img src={post.user.image} alt={post.user.name || 'User'} />
                      ) : (
                        <div className="post-avatar-placeholder-full">
                          {post.user.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="post-username-full">{post.user.name}</div>
                      <div className="post-time-full">{getTimeAgo(post.createdAt)}</div>
                    </div>
                  </div>
                </div>

                <div className="post-content-full">
                  <p>{post.content}</p>
                  {post.bookCover && (
                    <div className="post-book-full">
                      <img src={post.bookCover} alt={post.bookTitle || 'Book'} />
                      <div className="post-book-details">
                        <h4>{post.bookTitle}</h4>
                        {post.bookAuthors && <p>by {post.bookAuthors}</p>}
                      </div>
                    </div>
                  )}
                </div>

                <div className="post-actions-full">
                  <button
                    onClick={() => handleLike(post.id)}
                    disabled={liking === post.id}
                    className={`action-btn-full ${isLiked(post) ? 'liked' : ''}`}
                  >
                    <i className={`${isLiked(post) ? 'fas' : 'far'} fa-heart`}></i>
                    <span>{post.likes.length} {post.likes.length === 1 ? 'like' : 'likes'}</span>
                  </button>
                  <Link href={`/feed/${post.id}`} className="action-btn-full">
                    <i className="far fa-comment"></i>
                    <span>{post.comments.length} {post.comments.length === 1 ? 'comment' : 'comments'}</span>
                  </Link>
                </div>

                <Link href={`/feed/${post.id}`} className="view-comments-link">
                  View all comments
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}