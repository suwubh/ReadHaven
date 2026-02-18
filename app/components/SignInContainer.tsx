// app/components/SignInContainer.tsx

import Link from 'next/link';

export default function SignInContainer() {
  return (
    <div className="sign-in-container">
      <h3>Discover & read more</h3>
      <Link href="/api/auth/signin/github?callbackUrl=/">
        <button className="github-button">Continue with GitHub</button>
      </Link>
      <Link href="/api/auth/signin/google?callbackUrl=/">
        <button className="google-button">Continue with Google</button>
      </Link>
      <Link href="/signup">
        <button className="email-button">Sign up with email</button>
      </Link>
      <p>
        By creating an account, you agree to the ReadHaven{' '}
        <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
      </p>
      <p>
        Already a member? <Link href="/login">Sign In</Link>
      </p>
    </div>
  );
}
