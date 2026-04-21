import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
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
          <div className="flex flex-col gap-4 px-6 pb-2">
            <div>
              <Label htmlFor="item-title">Title *</Label>
              <Input
                id="item-title"
                type="text"
                placeholder="e.g. Sagrada Família"
                value={itemTitle}
                onChange={e => setItemTitle(e.target.value)}
                
              />
              {errors.title && <p className="text-destructive text-xs mt-1">{errors.title}</p>}
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
                    return (
                      <button
                        key={tag.name}
                        type="button"
                        onClick={() => toggleTag(tag.name)}
                        aria-pressed={isActive}
                        className="p-0 border-0 bg-transparent cursor-pointer"
                      >
                        <Badge
                          variant={isActive ? 'default' : 'secondary'}
                          className="cursor-pointer hover:opacity-80 transition-opacity px-3 py-1 text-xs font-semibold"
                        >
                          {tag.name}
                        </Badge>
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

            {error && <p className="text-destructive text-sm">{error}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="default" disabled={submitting}>
              {submitting ? 'Saving…' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
