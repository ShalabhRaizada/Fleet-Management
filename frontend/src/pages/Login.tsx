import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../api/client';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loginId, setLoginId] = useState('admin@fleet.test');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(loginId, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-8 w-full max-w-sm border border-gray-200">
        <h1 className="text-xl font-semibold mb-1">Fleet Management</h1>
        <p className="text-sm text-gray-500 mb-6">Sign in to continue</p>

        {error && <div className="bg-red-50 text-red-700 text-sm px-3 py-2 rounded mb-4">{error}</div>}

        <label className="block text-sm font-medium text-gray-700 mb-1">Login ID</label>
        <input
          className="w-full border border-gray-300 rounded px-3 py-2 mb-4 text-sm"
          value={loginId}
          onChange={(e) => setLoginId(e.target.value)}
          autoComplete="username"
        />

        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
        <input
          type="password"
          className="w-full border border-gray-300 rounded px-3 py-2 mb-6 text-sm"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2 rounded text-sm font-medium"
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>

        <p className="text-xs text-gray-400 mt-4">
          Seeded users: admin@fleet.test, fleetmanager@fleet.test, workshop@fleet.test, driver1@fleet.test,
          approver@fleet.test — password: Password@123
        </p>
      </form>
    </div>
  );
}
