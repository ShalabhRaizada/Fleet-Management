import { useEffect, useState } from 'react';
import { api, ApiError } from '../../api/client';
import type { MfaSetupResponse } from '../../types/api';

export default function MfaSetup() {
  const [mfaEnabled, setMfaEnabled] = useState<boolean | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  // Enable flow state
  const [setupData, setSetupData] = useState<MfaSetupResponse | null>(null);
  const [verifyCode, setVerifyCode] = useState('');
  const [enabling, setEnabling] = useState(false);

  // Disable flow state
  const [currentPassword, setCurrentPassword] = useState('');
  const [disabling, setDisabling] = useState(false);

  async function loadStatus() {
    setLoadingStatus(true);
    try {
      const me = await api.get<{ mfa_enabled?: boolean }>('/auth/me');
      setMfaEnabled(!!me.mfa_enabled);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load MFA status');
    } finally {
      setLoadingStatus(false);
    }
  }

  useEffect(() => {
    loadStatus();
  }, []);

  async function handleStartSetup() {
    setError(null);
    setInfo(null);
    setEnabling(true);
    try {
      const data = await api.post<MfaSetupResponse>('/auth/mfa/setup');
      setSetupData(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to start MFA setup');
    } finally {
      setEnabling(false);
    }
  }

  async function handleVerifySetup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setEnabling(true);
    try {
      await api.post('/auth/mfa/verify-setup', { code: verifyCode });
      setSetupData(null);
      setVerifyCode('');
      setInfo('MFA has been enabled for your account.');
      await loadStatus();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Invalid code');
    } finally {
      setEnabling(false);
    }
  }

  async function handleDisable(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setDisabling(true);
    try {
      await api.post('/auth/mfa/disable', { currentPassword });
      setCurrentPassword('');
      setInfo('MFA has been disabled for your account.');
      await loadStatus();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to disable MFA');
    } finally {
      setDisabling(false);
    }
  }

  return (
    <div className="col gap-16">
      <div className="page-header">
        <h1>Multi-factor authentication</h1>
      </div>

      {error && <div className="badge danger" style={{ display: 'block', padding: '8px 12px' }}>{error}</div>}
      {info && <div className="badge success" style={{ display: 'block', padding: '8px 12px' }}>{info}</div>}

      <div className="card" style={{ padding: 20, maxWidth: 480 }}>
        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8 }}>Status</div>
        {loadingStatus ? (
          <div className="muted">Loading...</div>
        ) : (
          <div className={`badge ${mfaEnabled ? 'success' : ''}`}>
            {mfaEnabled ? 'MFA is enabled' : 'MFA is not enabled'}
          </div>
        )}
      </div>

      {!loadingStatus && !mfaEnabled && (
        <div className="card" style={{ padding: 20, maxWidth: 480 }}>
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8 }}>Enable MFA</div>
          {!setupData ? (
            <button type="button" className="btn primary" disabled={enabling} onClick={handleStartSetup}>
              {enabling ? 'Generating...' : 'Start setup'}
            </button>
          ) : (
            <form onSubmit={handleVerifySetup} className="col gap-16">
              <p className="muted" style={{ fontSize: 13 }}>
                Add this secret to your authenticator app (or paste the otpauth URI directly), then enter the
                6-digit code it generates to confirm.
              </p>
              <div className="field">
                <label>Secret (base32)</label>
                <input className="input" readOnly value={setupData.secret} onFocus={(e) => e.currentTarget.select()} />
              </div>
              <div className="field">
                <label>otpauth:// URI</label>
                <input
                  className="input"
                  readOnly
                  value={setupData.otpauthUri}
                  onFocus={(e) => e.currentTarget.select()}
                />
              </div>
              <div className="field">
                <label>6-digit code</label>
                <input
                  className="input"
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value)}
                  inputMode="numeric"
                  maxLength={6}
                  autoComplete="one-time-code"
                />
              </div>
              <div className="row gap-8">
                <button type="submit" className="btn primary" disabled={enabling}>
                  {enabling ? 'Verifying...' : 'Verify and enable'}
                </button>
                <button type="button" className="btn" onClick={() => setSetupData(null)} disabled={enabling}>
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {!loadingStatus && mfaEnabled && (
        <div className="card" style={{ padding: 20, maxWidth: 480 }}>
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8 }}>Disable MFA</div>
          <form onSubmit={handleDisable} className="col gap-16">
            <div className="field">
              <label>Current password</label>
              <input
                type="password"
                className="input"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
            <button type="submit" className="btn danger" disabled={disabling}>
              {disabling ? 'Disabling...' : 'Disable MFA'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
