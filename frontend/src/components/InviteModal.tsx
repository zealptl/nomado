import { useEffect, useState } from 'react';
import { X, Copy, Check, RefreshCw } from 'lucide-react';
import { tripsApi } from '../lib/api';

interface InviteModalProps {
  tripId: string;
  onClose: () => void;
}

export default function InviteModal({ tripId, onClose }: InviteModalProps) {
  const [inviteUrl, setInviteUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generateLink(refresh = false) {
    setLoading(true);
    setError(null);
    try {
      const result = await tripsApi.generateInvite(tripId, refresh);
      setInviteUrl(result.url);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { generateLink(false); }, [tripId]);

  async function handleCopy() {
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: '480px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '22px' }}>Invite Collaborators</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }} aria-label="Close">
            <X size={20} color="var(--color-text-muted)" />
          </button>
        </div>

        <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
          Share this link with anyone you want to collaborate on this trip. The link expires in 7 days.
        </p>

        {error && <p style={{ color: 'var(--color-secondary)', fontSize: '13px', marginBottom: '12px' }}>{error}</p>}

        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <input
            className="input"
            readOnly
            value={loading ? 'Generating link…' : inviteUrl}
            style={{ fontSize: '13px', cursor: 'text' }}
          />
          <button
            className="btn-primary"
            onClick={handleCopy}
            disabled={loading || !inviteUrl}
            style={{ padding: '12px 16px', whiteSpace: 'nowrap', flexShrink: 0 }}
            aria-label="Copy invite link"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
        </div>

        <button
          className="btn-secondary"
          onClick={() => generateLink(true)}
          disabled={loading}
          style={{ fontSize: '13px', padding: '8px 14px' }}
        >
          <RefreshCw size={14} />
          Regenerate link
        </button>
      </div>
    </div>
  );
}
