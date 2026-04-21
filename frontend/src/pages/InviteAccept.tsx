import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { inviteApi } from '../lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

export default function InviteAccept() {
  const { token } = useParams<{ token: string }>()
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [status, setStatus] = useState<'idle' | 'accepting' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      navigate(`/?invite_token=${token}`, { replace: true })
      return
    }

    if (!token) {
      navigate('/dashboard', { replace: true })
      return
    }

    setStatus('accepting')
    inviteApi
      .accept(token)
      .then(({ tripId }) => navigate(`/trips/${tripId}`, { replace: true }))
      .catch((e: Error) => {
        setStatus('error')
        setErrorMsg(e.message)
      })
  }, [user, authLoading, token])

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <Card className="w-full max-w-[420px] text-center">
          <CardHeader>
            <CardTitle className="font-display">Invite Link Error</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Alert variant="destructive">
              <AlertDescription>{errorMsg}</AlertDescription>
            </Alert>
            <Button variant="default" onClick={() => navigate('/dashboard')}>
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <p className="text-muted-foreground">Joining trip…</p>
    </div>
  )
}
