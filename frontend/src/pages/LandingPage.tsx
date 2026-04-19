import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
    <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
  </svg>
)

const AppleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 814 1000" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76.5 0-103.7 40.8-165.9 40.8s-105-37.5-155.5-127.4C46.5 803 0 663 0 527.9c0-203.4 132.4-310.9 262.9-310.9 71.2 0 130.3 46.8 174.9 46.8 42.8 0 109.8-49.7 188.4-49.7 24 0 108.2 2.6 168.6 71.4zm-174.4-241.3C642.3 63.1 685.4 0 685.4 0c.6 1.3-96.9 55.8-131.2 124.6-28.5 58.1-71.6 126.1-84.9 143.1-.5-.6-24-11.3-80.9-11.3 11.4-30.2 24-76.9 115.2-157.1z"/>
  </svg>
)

export default function LandingPage() {
  const { session, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && session) {
      navigate('/dashboard', { replace: true })
    }
  }, [session, loading, navigate])

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  const signInWithApple = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  if (loading) return null

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--space-md)',
    }}>
      <div className="glass-card" style={{
        padding: '56px 48px',
        textAlign: 'center',
        maxWidth: '440px',
        width: '100%',
      }}>
        <h1 style={{ fontSize: '52px', fontWeight: 700, marginBottom: '8px', letterSpacing: '-0.5px' }}>
          Nomado
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '16px', marginBottom: '48px' }}>
          Plan your next adventure together
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button
            onClick={signInWithGoogle}
            className="btn-secondary"
            style={{ justifyContent: 'center', width: '100%', backgroundColor: '#fff', borderColor: 'rgba(124,106,90,0.3)' }}
            aria-label="Sign in with Google"
          >
            <GoogleIcon />
            <span>Sign in with Google</span>
          </button>

        </div>

        <p style={{ color: 'var(--color-text-muted)', fontSize: '12px', marginTop: '32px', lineHeight: '1.6' }}>
          By signing in, you agree to our terms and privacy policy.
        </p>
      </div>
    </div>
  )
}
