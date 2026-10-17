import { Link } from 'react-router-dom';
import { SearchX } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-3 px-4 py-20 text-center">
      <SearchX className="h-14 w-14 text-accent-text" aria-hidden="true" />
      <h1 className="text-3xl font-extrabold">404 — Wala dito</h1>
      <p className="text-muted">We couldn’t find that page. The link may be wrong or the page may have moved.</p>
      <Link to="/" className="btn-primary">Back to home</Link>
    </div>
  );
}
