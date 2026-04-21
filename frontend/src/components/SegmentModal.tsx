import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { TripSegment } from '../types'

interface SegmentModalProps {
  tripStartDate: string
  tripEndDate: string
  initial?: TripSegment
  onClose: () => void
  onSubmit: (data: { title: string; start_date: string; end_date: string }) => Promise<void>
  submitting?: boolean
  error?: string | null
}

export default function SegmentModal({
  tripStartDate,
  tripEndDate,
  initial,
  onClose,
  onSubmit,
  submitting,
  error,
}: SegmentModalProps) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [startDate, setStartDate] = useState(initial?.start_date ?? tripStartDate)
  const [endDate, setEndDate] = useState(initial?.end_date ?? tripEndDate)
  const [errors, setErrors] = useState<Record<string, string>>({})

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (!title.trim()) errs.title = 'Title is required'
    if (!startDate) errs.startDate = 'Start date is required'
    if (!endDate) errs.endDate = 'End date is required'
    if (startDate && endDate && endDate < startDate) errs.endDate = 'End date must be on or after start date'
    if (startDate < tripStartDate || endDate > tripEndDate) errs.startDate = 'Dates must be within the trip range'
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    await onSubmit({ title: title.trim(), start_date: startDate, end_date: endDate })
  }

  return (
    <Dialog open onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-[420px]">
        <DialogHeader>
          <DialogTitle>{initial ? 'Edit Segment' : 'Add Segment'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} noValidate>
          <div className="flex flex-col gap-4 px-6 pb-2">
            <div>
              <Label htmlFor="seg-title">Segment Name</Label>
              <Input
                id="seg-title"
                type="text"
                placeholder="e.g. Barcelona"
                value={title}
                onChange={e => setTitle(e.target.value)}
                
              />
              {errors.title && <p className="text-destructive text-xs mt-1">{errors.title}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="seg-start">Start Date</Label>
                <Input
                  id="seg-start"
                  type="date"
                  min={tripStartDate}
                  max={tripEndDate}
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  
                />
                {errors.startDate && <p className="text-destructive text-xs mt-1">{errors.startDate}</p>}
              </div>
              <div>
                <Label htmlFor="seg-end">End Date</Label>
                <Input
                  id="seg-end"
                  type="date"
                  min={tripStartDate}
                  max={tripEndDate}
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  
                />
                {errors.endDate && <p className="text-destructive text-xs mt-1">{errors.endDate}</p>}
              </div>
            </div>

            {error && <p className="text-destructive text-sm">{error}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="default" disabled={submitting}>
              {submitting ? 'Saving…' : initial ? 'Save Changes' : 'Add Segment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
