import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 text-center">
      <h1>Page Not Found</h1>
      <p className="muted">The page you requested doesn't exist.</p>
      <button onClick={() => navigate('/dashboard')} className="btn primary">
        Go to Dashboard
      </button>
    </div>
  );
}
