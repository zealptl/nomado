import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { inviteApi } from '../lib/api';

export default function InviteAccept() {
  const { token } = useParams<{ token: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'idle' | 'accepting' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      // Redirect to login preserving invite token
      navigate(`/?invite_token=${token}`, { replace: true });
      return;
    }

    if (!token) {
      navigate('/dashboard', { replace: true });
      return;
    }

    setStatus('accepting');
    inviteApi
      .accept(token)
      .then(({ tripId }) => navigate(`/trips/${tripId}`, { replace: true }))
      .catch((e: Error) => {
        setStatus('error');
        setErrorMsg(e.message);
      });
  }, [user, authLoading, token]);

  if (status === 'error') {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}>
        <div className="glass-card" style={{ padding: '40px', maxWidth: '420px', textAlign: 'center' }}>
          <h2 style={{ marginBottom: '12px', fontSize: '22px' }}>Invite Link Error</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', marginBottom: '24px' }}>
            {errorMsg}
          </p>
          <button className="btn-primary" onClick={() => navigate('/dashboard')}>
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <p style={{ color: 'var(--color-text-muted)' }}>Joining trip…</p>
    </div>
  );
}
