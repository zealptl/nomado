import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogBody } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input, Textarea, Label } from '@/components/ui/input'
import PhotoUploader from './PhotoUploader'
import type { ItineraryItem } from '../types'

interface Tag {
  id: string | null
  name: string
  isDefault: boolean
}

interface ItemFormModalProps {
  initialDate: string
  initial?: Partial<ItineraryItem> & { photos?: string[] }
  availableTags: Tag[]
  title: string
  onClose: () => void
  onSubmit: (data: Partial<ItineraryItem> & { photos?: string[] }) => Promise<void>
  submitting?: boolean
  error?: string | null
}

const TAG_COLORS: Record<string, { bg: string; text: string; border: string; activeBg: string }> = {
  food:       { bg: '#fff7ed', text: '#c2410c', border: '#fed7aa', activeBg: '#f97316' },
  drinks:     { bg: '#ecfeff', text: '#0e7490', border: '#a5f3fc', activeBg: '#06b6d4' },
  stay:       { bg: '#f0f9ff', text: '#0369a1', border: '#bae6fd', activeBg: '#0ea5e9' },
  activity:   { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0', activeBg: '#10b981' },
  'going out':{ bg: '#faf5ff', text: '#7c3aed', border: '#ddd6fe', activeBg: '#8b5cf6' },
}

export default function ItemFormModal({
  initialDate,
  initial,
  availableTags,
  title,
  onClose,
  onSubmit,
  submitting,
  error,
}: ItemFormModalProps) {
  const [itemTitle, setItemTitle] = useState(initial?.title ?? '')
  const [location, setLocation] = useState(initial?.location ?? '')
  const [mapsUrl, setMapsUrl] = useState(initial?.maps_url ?? '')
  const [timeStart, setTimeStart] = useState(initial?.time_start ?? '')
  const [timeEnd, setTimeEnd] = useState(initial?.time_end ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [tags, setTags] = useState<string[]>(initial?.tags ?? [])
  const [photos, setPhotos] = useState<string[]>(initial?.photos ?? [])
  const [errors, setErrors] = useState<Record<string, string>>({})

  function toggleTag(name: string) {
    setTags(prev => prev.includes(name) ? prev.filter(t => t !== name) : [...prev, name])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (!itemTitle.trim()) errs.title = 'Title is required'
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    await onSubmit({
      date: initialDate,
      title: itemTitle.trim(),
      location: location.trim() || null,
      maps_url: mapsUrl.trim() || null,
      time_start: timeStart || null,
      time_end: timeEnd || null,
      description: description.trim() || null,
      tags,
      photos,
    })
  }

  return (
    <Dialog open onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-[540px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} noValidate>
          <DialogBody className="pt-5 flex flex-col gap-4">
            <div>
              <Label htmlFor="item-title">Title *</Label>
              <Input
                id="item-title"
                type="text"
                placeholder="e.g. Sagrada Família"
                value={itemTitle}
                onChange={e => setItemTitle(e.target.value)}
                error={!!errors.title}
              />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
            </div>

            <div>
              <Label htmlFor="item-location">Location</Label>
              <Input
                id="item-location"
                type="text"
                placeholder="e.g. Barcelona, Spain"
                value={location}
                onChange={e => setLocation(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="item-maps">Maps Link</Label>
              <Input
                id="item-maps"
                type="url"
                placeholder="https://maps.google.com/..."
                value={mapsUrl}
                onChange={e => setMapsUrl(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="item-time-start">Start Time</Label>
                <Input id="item-time-start" type="time" value={timeStart} onChange={e => setTimeStart(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="item-time-end">End Time</Label>
                <Input id="item-time-end" type="time" value={timeEnd} onChange={e => setTimeEnd(e.target.value)} />
              </div>
            </div>

            <div>
              <Label htmlFor="item-desc">Description</Label>
              <Textarea
                id="item-desc"
                placeholder="Notes, reservations, things to know…"
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            {availableTags.length > 0 && (
              <div>
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map(tag => {
                    const isActive = tags.includes(tag.name)
                    const colors = TAG_COLORS[tag.name]
                    return (
                      <button
                        key={tag.name}
                        type="button"
                        onClick={() => toggleTag(tag.name)}
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border cursor-pointer transition-all duration-150"
                        style={isActive && colors ? {
                          backgroundColor: colors.activeBg,
                          color: 'white',
                          borderColor: colors.activeBg,
                        } : colors ? {
                          backgroundColor: colors.bg,
                          color: colors.text,
                          borderColor: colors.border,
                        } : {
                          backgroundColor: '#f1f5f9',
                          color: '#475569',
                          borderColor: '#e2e8f0',
                        }}
                        aria-pressed={isActive}
                      >
                        {tag.name}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            <div>
              <Label>Photos</Label>
              <PhotoUploader onPhotosChange={setPhotos} />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}
          </DialogBody>

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? 'Saving…' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
