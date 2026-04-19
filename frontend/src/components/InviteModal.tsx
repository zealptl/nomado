import { useEffect, useState } from 'react'
import { Copy, Check, RefreshCw, Users } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogBody } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
            <div className="w-9 h-9 rounded-xl bg-sky-50 flex items-center justify-center flex-shrink-0">
              <Users size={18} className="text-sky-500" />
            </div>
            <DialogTitle>Invite Collaborators</DialogTitle>
          </div>
          <DialogDescription>
            Share this link with anyone you want to collaborate on this trip. The link expires in 7 days.
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="pt-4 flex flex-col gap-4">
          {error && (
            <p className="text-red-500 text-sm bg-red-50 border border-red-100 rounded-xl px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex gap-2">
            <Input
              readOnly
              value={loading ? 'Generating link…' : inviteUrl}
              className="text-sm text-slate-500 bg-slate-50"
            />
            <Button
              variant="primary"
              onClick={handleCopy}
              disabled={loading || !inviteUrl}
              className="flex-shrink-0 gap-2"
              aria-label="Copy invite link"
            >
              {copied ? <Check size={15} /> : <Copy size={15} />}
              {copied ? 'Copied!' : 'Copy'}
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => generateLink(true)}
            disabled={loading}
            className="self-start gap-1.5 text-slate-400 hover:text-sky-500"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Regenerate link
          </Button>
        </DialogBody>
      </DialogContent>
    </Dialog>
  )
}
