import { useRef, useState } from 'react'
import { Image, X } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogBody } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input, Label } from '@/components/ui/input'
import { tripsApi } from '../lib/api'
import { useImageUpload } from '../hooks/useImageUpload'
import type { Trip } from '../types'

interface CreateTripModalProps {
  onClose: () => void
  onCreated: (trip: Trip) => void
}

export default function CreateTripModal({ onClose, onCreated }: CreateTripModalProps) {
  const [name, setName] = useState('')
  const [destination, setDestination] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [coverImageUrl, setCoverImageUrl] = useState<string | undefined>()
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const coverInputRef = useRef<HTMLInputElement>(null)
  const { uploading: uploadingCover, upload: uploadCover } = useImageUpload()

  async function handleCoverFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setCoverPreview(URL.createObjectURL(file))
    const url = await uploadCover(file, 'trip-covers')
    if (url) setCoverImageUrl(url)
    else setCoverPreview(null)
  }

  function validate() {
    const e: Record<string, string> = {}
    if (!name.trim()) e.name = 'Trip name is required'
    if (!destination.trim()) e.destination = 'Destination is required'
    if (!startDate) e.startDate = 'Start date is required'
    if (!endDate) e.endDate = 'End date is required'
    if (startDate && endDate && endDate < startDate) e.endDate = 'End date must be after start date'
    return e
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    setSubmitting(true)
    try {
      const trip = await tripsApi.create({
        name: name.trim(),
        destination: destination.trim(),
        start_date: startDate,
        end_date: endDate,
        cover_image_url: coverImageUrl,
      })
      onCreated(trip)
    } catch (err: any) {
      setErrors({ submit: err.message })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Plan a new trip</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} noValidate>
          <DialogBody className="pt-5 flex flex-col gap-4">
            {/* Cover photo */}
            <div>
              <Label>
                Cover Photo{' '}
                <span className="font-normal text-slate-400">(optional)</span>
              </Label>
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleCoverFileChange}
              />
              {coverPreview ? (
                <div className="relative h-32 rounded-xl overflow-hidden border border-slate-200">
                  <img src={coverPreview} alt="Cover preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => { setCoverPreview(null); setCoverImageUrl(undefined) }}
                    className="absolute top-2 right-2 bg-slate-900/60 hover:bg-slate-900/80 text-white rounded-full w-6 h-6 flex items-center justify-center cursor-pointer transition-colors"
                    aria-label="Remove cover photo"
                  >
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => coverInputRef.current?.click()}
                  disabled={uploadingCover}
                  className="w-full py-5 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-sm font-medium flex items-center justify-center gap-2 hover:border-sky-300 hover:text-sky-500 hover:bg-sky-50/50 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-default"
                >
                  <Image size={16} />
                  {uploadingCover ? 'Uploading…' : 'Upload Cover Photo'}
                </button>
              )}
            </div>

            <div>
              <Label htmlFor="trip-name">Trip Name</Label>
              <Input
                id="trip-name"
                type="text"
                placeholder="Summer in Europe"
                value={name}
                onChange={e => setName(e.target.value)}
                error={!!errors.name}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <Label htmlFor="trip-destination">Destination</Label>
              <Input
                id="trip-destination"
                type="text"
                placeholder="Spain, France, Italy"
                value={destination}
                onChange={e => setDestination(e.target.value)}
                error={!!errors.destination}
              />
              {errors.destination && <p className="text-red-500 text-xs mt-1">{errors.destination}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="trip-start">Start Date</Label>
                <Input
                  id="trip-start"
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  error={!!errors.startDate}
                />
                {errors.startDate && <p className="text-red-500 text-xs mt-1">{errors.startDate}</p>}
              </div>
              <div>
                <Label htmlFor="trip-end">End Date</Label>
                <Input
                  id="trip-end"
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  error={!!errors.endDate}
                />
                {errors.endDate && <p className="text-red-500 text-xs mt-1">{errors.endDate}</p>}
              </div>
            </div>

            {errors.submit && <p className="text-red-500 text-sm">{errors.submit}</p>}
          </DialogBody>

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="cta" disabled={submitting}>
              {submitting ? 'Creating…' : 'Create Trip'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
