import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function AuthCallback() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const handleCallback = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()

      if (error || !session) {
        navigate('/', { replace: true })
        return
      }

      const inviteToken = searchParams.get('invite_token')
      if (inviteToken) {
        navigate(`/invite/${inviteToken}`, { replace: true })
      } else {
        navigate('/dashboard', { replace: true })
      }
    }

    handleCallback()
  }, [navigate, searchParams])

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div className="glass-card" style={{ padding: '48px', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '8px' }}>Signing you in…</h2>
        <p style={{ color: 'var(--color-text-muted)' }}>Please wait a moment.</p>
      </div>
    </div>
  )
}
