import { LogOut } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { Button } from '@/components/ui/button'

export default function AppHeader() {
  const { user } = useAuth()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-100 shadow-sm shadow-slate-900/5">
      <div className="max-w-[1400px] mx-auto flex items-center justify-between px-6 h-16">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-extrabold"
            style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)' }}
            aria-hidden="true"
          >
            N
          </div>
          <span
            className="text-xl font-extrabold tracking-tight"
            style={{
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              background: 'linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Nomado
          </span>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {user?.email && (
            <span className="hidden sm:block text-sm text-slate-400 font-medium truncate max-w-[200px]">
              {user.email}
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="gap-1.5 text-slate-500 hover:text-slate-700"
            aria-label="Sign out"
          >
            <LogOut size={15} />
            <span className="hidden sm:inline">Sign out</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
