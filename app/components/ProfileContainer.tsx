// app/components/ProfileContainer.tsx

'use client';

import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { User } from 'next-auth';

interface ProfileContainerProps {
  user: User;
}

export default function ProfileContainer({ user }: ProfileContainerProps) {
  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  return (
    <div className="profile-container">
      {/* User Info Section */}
      <div className="profile-header">
        <div className="profile-avatar">
          {user.image ? (
            <img src={user.image} alt={user.name || 'User'} />
          ) : (
            <div className="avatar-placeholder">
              {user.name?.charAt(0).toUpperCase() || 'U'}
            </div>
          )}
        </div>
        <div className="profile-info">
          <h3>{user.name || 'Reader'}</h3>
          <p className="profile-email">{user.email}</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="profile-stats">
        <div className="stat-item">
          <span className="stat-number">0</span>
          <span className="stat-label">Books</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">0</span>
          <span className="stat-label">Reviews</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">0</span>
          <span className="stat-label">Friends</span>
        </div>
      </div>

      {/* Shelves Section */}
      <div className="profile-section">
        <h4 className="section-title">My Shelves</h4>
        <ul className="shelf-list">
          <li className="shelf-item">
            <Link href="/shelf/want-to-read">
              <i className="fas fa-bookmark"></i>
              <span>Want to Read</span>
              <span className="shelf-count">0</span>
            </Link>
          </li>
          <li className="shelf-item">
            <Link href="/shelf/currently-reading">
              <i className="fas fa-book-open"></i>
              <span>Currently Reading</span>
              <span className="shelf-count">0</span>
            </Link>
          </li>
          <li className="shelf-item">
            <Link href="/shelf/read">
              <i className="fas fa-check-circle"></i>
              <span>Read</span>
              <span className="shelf-count">0</span>
            </Link>
          </li>
          <li className="shelf-item">
            <Link href="/shelf/favorites">
              <i className="fas fa-heart"></i>
              <span>Favorites</span>
              <span className="shelf-count">0</span>
            </Link>
          </li>
        </ul>
      </div>

      {/* Quick Links */}
      <div className="profile-section">
        <h4 className="section-title">Quick Links</h4>
        <ul className="quick-links">
          <li>
            <Link href="/profile">
              <i className="fas fa-user"></i>
              View Profile
            </Link>
          </li>
          <li>
            <Link href="/reviews">
              <i className="fas fa-star"></i>
              My Reviews
            </Link>
          </li>
          <li>
            <Link href="/friends">
              <i className="fas fa-users"></i>
              My Friends
            </Link>
          </li>
          <li>
            <Link href="/reading-challenge">
              <i className="fas fa-trophy"></i>
              Reading Challenge
            </Link>
          </li>
          <li>
            <Link href="/settings">
              <i className="fas fa-cog"></i>
              Settings
            </Link>
          </li>
        </ul>
      </div>

      {/* Current Reading Progress */}
      <div className="profile-section">
        <h4 className="section-title">2024 Reading Goal</h4>
        <div className="reading-goal">
          <div className="goal-progress-bar">
            <div className="goal-progress-fill" style={{ width: '0%' }}></div>
          </div>
          <p className="goal-text">0 of 20 books read</p>
          <Link href="/reading-challenge" className="goal-link">
            Update Goal
          </Link>
        </div>
      </div>

      {/* Sign Out Button */}
      <button onClick={handleSignOut} className="sign-out-btn">
        <i className="fas fa-sign-out-alt"></i>
        Sign Out
      </button>
    </div>
  );
}