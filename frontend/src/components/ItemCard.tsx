import { useState } from 'react'
import { MapPin, Clock, ExternalLink, ChevronDown, ChevronUp, Pencil, Trash2, MoreVertical } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { ItineraryItem } from '../types'

interface ItemCardProps {
  item: ItineraryItem & { item_photos?: { id: string; storage_url: string }[] }
  onEdit: () => void
  onDelete: () => void
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

  const photos = item.item_photos ?? []
  const timeStr = item.time_start
    ? item.time_end
      ? `${formatTime(item.time_start)} – ${formatTime(item.time_end)}`
      : formatTime(item.time_start)
    : null

  return (
    <Card className="group overflow-hidden border border-border shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex">
        <div className="w-1 flex-shrink-0 rounded-l-xl bg-primary" />

        <CardContent className="flex items-start justify-between gap-3 p-4 flex-1 min-w-0">
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-card-foreground text-sm mb-1.5 leading-snug font-display">
              {item.title}
            </h4>

            <div className="flex flex-wrap gap-x-4 gap-y-1 mb-2">
              {item.location && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin size={11} className="flex-shrink-0 text-primary" />
                  {item.maps_url ? (
                    <a
                      href={item.maps_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline text-primary"
                      onClick={e => e.stopPropagation()}
                    >
                      {item.location}
                      <ExternalLink size={9} className="inline ml-0.5 -mt-0.5" />
                    </a>
                  ) : item.location}
                </span>
              )}
              {timeStr && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock size={11} className="flex-shrink-0" />
                  {timeStr}
                </span>
              )}
            </div>

            {item.description && (
              <p className="text-xs text-muted-foreground mb-2 leading-relaxed line-clamp-2">
                {item.description}
              </p>
            )}

            {item.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-1.5">
                {item.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {photos.length > 0 && (
              <button
                type="button"
                onClick={() => setPhotosExpanded(e => !e)}
                className="flex items-center gap-1 text-xs font-medium text-primary transition-colors cursor-pointer bg-transparent border-0 p-0"
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
                    className="w-20 h-20 object-cover rounded-lg border border-border"
                  />
                ))}
              </div>
            )}
          </div>

          <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Item actions">
                  <MoreVertical size={13} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEdit}>
                  <Pencil size={13} className="mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={onDelete}
                  className="text-destructive focus:text-destructive focus:bg-destructive/10"
                >
                  <Trash2 size={13} className="mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </div>
    </Card>
  )
}
