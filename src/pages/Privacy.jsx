import { Link } from 'react-router-dom';
import { PolicyContent } from '../components/PolicyContent.jsx';
import { policyMeta } from '../content/privacyPolicy.js';

export default function Privacy() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-4 text-3xl font-extrabold">{policyMeta.title}</h1>
      <PolicyContent />
      <p className="mt-8 text-sm text-muted">Agreeing is done by ticking the checkbox when you <Link to="/register" className="underline">register</Link>. Ticking it is a recorded acknowledgement, not a guarantee of legal compliance.</p>
    </div>
  );
}
