import { useState } from 'react'
import { MapPin, Clock, ExternalLink, ChevronDown, ChevronUp, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ItineraryItem } from '../types'

interface ItemCardProps {
  item: ItineraryItem & { item_photos?: { id: string; storage_url: string }[] }
  onEdit: () => void
  onDelete: () => void
}

const TAG_ACCENTS: Record<string, string> = {
  food: '#f97316',
  drinks: '#06b6d4',
  stay: '#0ea5e9',
  activity: '#10b981',
  'going out': '#8b5cf6',
}

function getAccentColor(tags: string[]): string {
  for (const tag of tags) {
    if (TAG_ACCENTS[tag]) return TAG_ACCENTS[tag]
  }
  return '#0ea5e9'
}

function formatTime(t: string | null) {
  if (!t) return null
  const [h, m] = t.split(':')
  const hour = parseInt(h)
  const ampm = hour >= 12 ? 'pm' : 'am'
  const displayHour = hour % 12 || 12
  return `${displayHour}:${m}${ampm}`
}

export default function ItemCard({ item, onEdit, onDelete }: ItemCardProps) {
  const [photosExpanded, setPhotosExpanded] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const photos = item.item_photos ?? []
  const timeStr = item.time_start
    ? item.time_end
      ? `${formatTime(item.time_start)} – ${formatTime(item.time_end)}`
      : formatTime(item.time_start)
    : null

  const accentColor = getAccentColor(item.tags)

  return (
    <div className="group bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md hover:shadow-slate-200/60 transition-all duration-200 overflow-hidden">
      <div className="flex">
        {/* Left accent bar */}
        <div className="w-1 flex-shrink-0 rounded-l-xl" style={{ backgroundColor: accentColor }} />

        <div className="flex items-start justify-between gap-3 p-4 flex-1 min-w-0">
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-slate-900 text-sm mb-1.5 leading-snug" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              {item.title}
            </h4>

            <div className="flex flex-wrap gap-x-4 gap-y-1 mb-2">
              {item.location && (
                <span className="flex items-center gap-1 text-xs text-slate-400">
                  <MapPin size={11} className="flex-shrink-0" style={{ color: accentColor }} />
                  {item.maps_url ? (
                    <a
                      href={item.maps_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                      style={{ color: accentColor }}
                      onClick={e => e.stopPropagation()}
                    >
                      {item.location}
                      <ExternalLink size={9} className="inline ml-0.5 -mt-0.5" />
                    </a>
                  ) : item.location}
                </span>
              )}
              {timeStr && (
                <span className="flex items-center gap-1 text-xs text-slate-400">
                  <Clock size={11} className="flex-shrink-0" />
                  {timeStr}
                </span>
              )}
            </div>

            {item.description && (
              <p className="text-xs text-slate-400 mb-2 leading-relaxed line-clamp-2">
                {item.description}
              </p>
            )}

            {item.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-1.5">
                {item.tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border"
                    style={{
                      backgroundColor: `${TAG_ACCENTS[tag] ?? '#0ea5e9'}15`,
                      color: TAG_ACCENTS[tag] ?? '#0ea5e9',
                      borderColor: `${TAG_ACCENTS[tag] ?? '#0ea5e9'}30`,
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {photos.length > 0 && (
              <button
                type="button"
                onClick={() => setPhotosExpanded(e => !e)}
                className="flex items-center gap-1 text-xs font-medium transition-colors cursor-pointer"
                style={{ color: accentColor, background: 'none', border: 'none', padding: 0 }}
                aria-label={photosExpanded ? 'Hide photos' : 'Show photos'}
              >
                {photosExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                {photos.length} photo{photos.length !== 1 ? 's' : ''}
              </button>
            )}

            {photosExpanded && photos.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {photos.map(p => (
                  <img
                    key={p.id}
                    src={p.storage_url}
                    alt=""
                    className="w-20 h-20 object-cover rounded-lg border border-slate-100"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onEdit}
              aria-label="Edit item"
              className="text-slate-400 hover:text-sky-500 hover:bg-sky-50"
            >
              <Pencil size={13} />
            </Button>
            {confirmDelete ? (
              <div className="flex gap-1 items-center">
                <Button
                  variant="danger"
                  size="icon-sm"
                  onClick={onDelete}
                  aria-label="Confirm delete"
                >
                  <Trash2 size={13} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setConfirmDelete(false)}
                  aria-label="Cancel delete"
                >
                  ✕
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setConfirmDelete(true)}
                aria-label="Delete item"
                className="text-slate-400 hover:text-red-500 hover:bg-red-50"
              >
                <Trash2 size={13} />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
