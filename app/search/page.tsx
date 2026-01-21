// app/search/page.tsx
import { Suspense } from 'react';
import SearchClient from './SearchClient';

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="search-loading">Loading search…</div>}>
      <SearchClient />
    </Suspense>
  );
}
