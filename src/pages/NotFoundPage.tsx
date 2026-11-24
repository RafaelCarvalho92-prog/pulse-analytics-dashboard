import { Link } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';

export default function NotFoundPage() {
  return (
    <div className="card p-10 text-center">
      <PageHeader title="Page not found" />
      <p className="text-slate-500 dark:text-slate-400">
        The page you are looking for does not exist.{' '}
        <Link to="/" className="font-medium text-brand-600 hover:underline dark:text-brand-300">
          Back to overview
        </Link>
      </p>
    </div>
  );
}
