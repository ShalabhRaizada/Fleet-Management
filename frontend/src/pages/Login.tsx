import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../api/client';

export default function Login() {
  const { login, completeMfaLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [tempToken, setTempToken] = useState<string | null>(null);
  const [mfaCode, setMfaCode] = useState('');

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await login(loginId, password);
      if ('mfaRequired' in result && result.mfaRequired) {
        setTempToken(result.tempToken);
        return;
      }
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleMfaSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!tempToken) return;
    setError(null);
    setLoading(true);
    try {
      await completeMfaLogin(tempToken, mfaCode);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'MFA verification failed');
    } finally {
      setLoading(false);
    }
  }

  if (tempToken) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <form onSubmit={handleMfaSubmit} className="card" style={{ padding: 32, width: '100%', maxWidth: 380 }}>
          <h1 style={{ margin: 0, fontSize: 19, fontWeight: 600, letterSpacing: '-0.015em' }}>Two-factor verification</h1>
          <p className="muted" style={{ marginTop: 4, marginBottom: 24, fontSize: 13 }}>
            Enter the 6-digit code from your authenticator app.
          </p>

          {error && <div className="badge danger" style={{ display: 'block', padding: '8px 12px', marginBottom: 16 }}>{error}</div>}

          <div className="field" style={{ marginBottom: 22 }}>
            <label>Authentication code</label>
            <input
              className="input"
              value={mfaCode}
              onChange={(e) => setMfaCode(e.target.value)}
              inputMode="numeric"
              maxLength={6}
              autoComplete="one-time-code"
              autoFocus
            />
          </div>

          <button type="submit" disabled={loading} className="btn primary lg" style={{ width: '100%', justifyContent: 'center' }}>
            {loading ? 'Verifying...' : 'Verify'}
          </button>
          <button
            type="button"
            className="btn"
            style={{ width: '100%', justifyContent: 'center', marginTop: 10 }}
            onClick={() => {
              setTempToken(null);
              setMfaCode('');
              setError(null);
            }}
          >
            Back to login
          </button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <form onSubmit={handleSubmit} className="card" style={{ padding: 32, width: '100%', maxWidth: 380 }}>
        <div className="row" style={{ marginBottom: 4 }}>
          <div className="brand-mark" style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #2563eb, #10b981)', display: 'grid', placeItems: 'center', color: 'white', fontWeight: 700, fontSize: 14 }}>
            GL
          </div>
          <h1 style={{ margin: 0, fontSize: 19, fontWeight: 600, letterSpacing: '-0.015em' }}>GreenLine VMS</h1>
        </div>
        <p className="muted" style={{ marginTop: 4, marginBottom: 24, fontSize: 13 }}>Sign in to continue</p>

        {error && <div className="badge danger" style={{ display: 'block', padding: '8px 12px', marginBottom: 16 }}>{error}</div>}

        <div className="field" style={{ marginBottom: 14 }}>
          <label>Login ID</label>
          <input
            className="input"
            value={loginId}
            onChange={(e) => setLoginId(e.target.value)}
            autoComplete="username"
          />
        </div>

        <div className="field" style={{ marginBottom: 22 }}>
          <label>Password</label>
          <input
            type="password"
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>

        <button type="submit" disabled={loading} className="btn primary lg" style={{ width: '100%', justifyContent: 'center' }}>
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
