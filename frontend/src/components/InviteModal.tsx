import { useEffect, useState } from 'react'
import { Copy, Check, RefreshCw, Users } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { tripsApi } from '../lib/api'

interface InviteModalProps {
  tripId: string
  onClose: () => void
}

export default function InviteModal({ tripId, onClose }: InviteModalProps) {
  const [inviteUrl, setInviteUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function generateLink(refresh = false) {
    setLoading(true)
    setError(null)
    try {
      const result = await tripsApi.generateInvite(tripId, refresh)
      setInviteUrl(result.url)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { generateLink(false) }, [tripId])

  async function handleCopy() {
    await navigator.clipboard.writeText(inviteUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-[480px]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center flex-shrink-0">
              <Users size={18} className="text-primary" />
            </div>
            <DialogTitle>Invite Collaborators</DialogTitle>
          </div>
          <DialogDescription>
            Share this link with anyone you want to collaborate on this trip. The link expires in 7 days.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 px-6 pb-2">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Input
              readOnly
              value={loading ? 'Generating link…' : inviteUrl}
              className="text-sm text-muted-foreground bg-muted/30"
            />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="default"
                    onClick={handleCopy}
                    disabled={loading || !inviteUrl}
                    className="flex-shrink-0 gap-2"
                    aria-label="Copy invite link"
                  >
                    {copied ? <Check size={15} /> : <Copy size={15} />}
                    {copied ? 'Copied!' : 'Copy'}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Copy invite link to clipboard</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => generateLink(true)}
            disabled={loading}
            className="self-start gap-1.5 text-muted-foreground hover:text-primary"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Regenerate link
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
