'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface CommentItem {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

interface PostDetail {
  id: string;
  content: string;
  bookTitle: string | null;
  bookCover: string | null;
  bookAuthors: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
  likesCount: number;
  comments: CommentItem[];
}

interface Props {
  post: PostDetail;
  currentUserId?: string;
}

const loginWithNoticeHref = '/login?notice=login-required';

const getTimeAgo = (dateValue: string) => {
  const seconds = Math.floor((Date.now() - new Date(dateValue).getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
};

export default function PostDetailClient({ post, currentUserId }: Props) {
  const router = useRouter();
  const [comments, setComments] = useState<CommentItem[]>(post.comments);
  const [commentContent, setCommentContent] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentError, setCommentError] = useState('');

  const handleCreateComment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCommentError('');

    if (!currentUserId) {
      router.push(loginWithNoticeHref);
      return;
    }

    const trimmed = commentContent.trim();
    if (!trimmed) {
      setCommentError('Please enter a comment before posting.');
      return;
    }

    setSubmittingComment(true);
    try {
      const response = await fetch(`/api/posts/${post.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: trimmed }),
      });

      let data: unknown = null;
      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        const message =
          typeof data === 'object' &&
          data !== null &&
          'error' in data &&
          typeof (data as { error?: unknown }).error === 'string'
            ? (data as { error: string }).error
            : 'Failed to add comment.';
        setCommentError(message);
        return;
      }

      const createdComment = data as CommentItem;
      setComments((prev) => [...prev, createdComment]);
      setCommentContent('');
    } catch (error) {
      console.error('Create comment error:', error);
      setCommentError('Something went wrong. Please try again.');
    } finally {
      setSubmittingComment(false);
    }
  };

  return (
    <div className="feed-post-detail-page">
      <div className="feed-page-header">
        <Link href="/feed" className="back-home">
          {'<'} Back to Feed
        </Link>
        <h1>Post Discussion</h1>
        <Link href={currentUserId ? '/create-post' : loginWithNoticeHref} className="create-post-header-btn">
          <i className="fas fa-plus"></i>
          Create Post
        </Link>
      </div>

      <div className="feed-post-detail-container">
        <article className="feed-post-full">
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
                <div className="post-username-full">{post.user.name || 'Unknown User'}</div>
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
            <span className="action-btn-full">
              <i className="far fa-heart"></i>
              <span>{post.likesCount} {post.likesCount === 1 ? 'like' : 'likes'}</span>
            </span>
            <span className="action-btn-full">
              <i className="far fa-comment"></i>
              <span>{comments.length} {comments.length === 1 ? 'comment' : 'comments'}</span>
            </span>
          </div>
        </article>

        <section className="comments-panel">
          <div className="comments-panel-header">
            <h2>Comments</h2>
            <span className="comments-count-badge">{comments.length}</span>
          </div>

          {!currentUserId && (
            <p className="comment-login-hint">
              Want to join the discussion? <Link href={loginWithNoticeHref}>Log in first</Link>.
            </p>
          )}

          <form onSubmit={handleCreateComment} className="comment-form">
            <textarea
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              placeholder={currentUserId ? 'Write a comment...' : 'Log in to comment'}
              className="comment-input"
              disabled={submittingComment}
              rows={3}
            />
            <div className="comment-form-footer">
              {commentError ? <p className="comment-error">{commentError}</p> : <span />}
              <button
                type="submit"
                disabled={submittingComment}
                className="comment-submit-btn"
              >
                {submittingComment ? 'Posting...' : 'Post Comment'}
              </button>
            </div>
          </form>

          {comments.length === 0 ? (
            <p className="no-comments-text">No comments yet. Be the first to reply.</p>
          ) : (
            <div className="comments-list">
              {comments.map((comment) => (
                <article key={comment.id} className="comment-item">
                  <div className="comment-item-header">
                    <div className="comment-user-row">
                      <div className="comment-avatar">
                        {comment.user.image ? (
                          <img src={comment.user.image} alt={comment.user.name || 'User'} />
                        ) : (
                          <div className="comment-avatar-placeholder">
                            {comment.user.name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="comment-author">{comment.user.name || 'Unknown User'}</p>
                        <p className="comment-time">{getTimeAgo(comment.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                  <p className="comment-content">{comment.content}</p>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

