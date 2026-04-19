import { LogOut } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

export default function AppHeader() {
  const { user } = useAuth()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 24px',
      borderBottom: '1px solid rgba(255,255,255,0.3)',
      background: 'rgba(255,255,255,0.5)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      position: 'sticky',
      top: 0,
      zIndex: 10,
    }}>
      <h2 style={{ fontSize: '22px', fontWeight: 700 }}>Nomado</h2>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {user?.email && (
          <span style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>
            {user.email}
          </span>
        )}
        <button
          onClick={handleSignOut}
          className="btn-secondary"
          style={{ padding: '8px 16px', fontSize: '13px' }}
          aria-label="Sign out"
        >
          <LogOut size={14} />
          Sign out
        </button>
      </div>
    </header>
  )
}
