import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
    <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
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

  if (loading) return null

  return (
    <div className="min-h-screen flex flex-col bg-primary">
      <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden px-4">
        {/* Decorative blobs using CSS variables */}
        <div
          className="absolute top-[-10%] right-[-5%] w-96 h-96 rounded-full opacity-20 bg-background"
          style={{ filter: 'blur(80px)' }}
          aria-hidden="true"
        />
        <div
          className="absolute bottom-[-15%] left-[-8%] w-[500px] h-[500px] rounded-full opacity-15 bg-secondary"
          style={{ filter: 'blur(100px)' }}
          aria-hidden="true"
        />

        <div className="relative z-10 w-full max-w-md mx-auto">
          {/* Logo mark */}
          <div className="flex justify-center mb-8">
            <div className="bg-primary-foreground/20 backdrop-blur-sm rounded-2xl p-3.5 border border-primary-foreground/30">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-foreground" aria-hidden="true">
                <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21 4 19 4c-1 0-2 .5-2.8 1.3L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>
              </svg>
            </div>
          </div>

          {/* Wordmark */}
          <div className="text-center mb-10">
            <h1 className="text-6xl font-extrabold text-primary-foreground mb-3 tracking-tight font-display" style={{ letterSpacing: '-0.03em' }}>
              Nomado
            </h1>
            <p className="text-primary-foreground/80 text-lg font-medium">
              Plan your next adventure together
            </p>
            <p className="text-primary-foreground/60 text-sm mt-1.5">
              Collaborative itineraries, day by day.
            </p>
          </div>

          {/* Sign-in card */}
          <Card className="shadow-2xl border-0">
            <CardContent className="p-8">
              <p className="text-muted-foreground text-sm text-center mb-6 font-medium">
                Sign in to get started
              </p>
              <Button
                variant="secondary"
                size="lg"
                onClick={signInWithGoogle}
                className="w-full justify-center gap-3 font-semibold"
                aria-label="Sign in with Google"
              >
                <GoogleIcon />
                Continue with Google
              </Button>

              <p className="text-muted-foreground text-xs text-center mt-6 leading-relaxed">
                By signing in, you agree to our terms and privacy policy.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
