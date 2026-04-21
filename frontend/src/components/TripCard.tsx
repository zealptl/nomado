import { MapPin, Calendar } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Trip } from '../types'

interface TripCardProps {
  trip: Trip
  onClick: () => void
}

const CARD_GRADIENTS = [
  'linear-gradient(135deg, hsl(201 11% 30%) 0%, hsl(201 11% 41%) 50%, hsl(201 22% 60%) 100%)',
  'linear-gradient(135deg, hsl(201 22% 55%) 0%, hsl(187 37% 70%) 50%, hsl(182 82% 85%) 100%)',
  'linear-gradient(135deg, hsl(197 20% 18%) 0%, hsl(201 11% 41%) 50%, hsl(201 22% 69%) 100%)',
  'linear-gradient(135deg, hsl(201 11% 35%) 0%, hsl(187 37% 65%) 60%, hsl(182 82% 88%) 100%)',
  'linear-gradient(135deg, hsl(197 20% 25%) 0%, hsl(201 22% 55%) 50%, hsl(187 37% 75%) 100%)',
  'linear-gradient(135deg, hsl(201 22% 60%) 0%, hsl(182 82% 85%) 50%, hsl(187 37% 90%) 100%)',
]

function getGradient(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return CARD_GRADIENTS[Math.abs(hash) % CARD_GRADIENTS.length]
}

function formatDateRange(start: string, end: string): string {
  const s = new Date(start + 'T00:00:00')
  const e = new Date(end + 'T00:00:00')
  const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  return `${fmt(s)} – ${fmt(e)}`
}

function dayCount(start: string, end: string): number {
  const s = new Date(start + 'T00:00:00')
  const e = new Date(end + 'T00:00:00')
  return Math.round((e.getTime() - s.getTime()) / 86400000) + 1
}

export default function TripCard({ trip, onClick }: TripCardProps) {
  const days = dayCount(trip.start_date, trip.end_date)

  return (
    <Card
      className="group overflow-hidden border border-border shadow-sm hover:shadow-lg hover:shadow-foreground/5 transition-all duration-300 cursor-pointer hover:-translate-y-1"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick()}
      aria-label={`Open trip: ${trip.name}`}
    >
      {/* Image area */}
      <div className="relative h-48 overflow-hidden">
        {trip.cover_image_url ? (
          <img
            src={trip.cover_image_url}
            alt={trip.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div
            className="w-full h-full flex items-end p-4"
            style={{ background: getGradient(trip.name) }}
          >
            <span className="text-primary-foreground/90 text-3xl font-extrabold tracking-tight leading-none font-display">
              {trip.name.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase()).join('')}
            </span>
          </div>
        )}
        <div className="absolute top-3 right-3">
          <Badge variant="secondary" className="text-xs font-semibold shadow-sm">
            {days} {days === 1 ? 'day' : 'days'}
          </Badge>
        </div>
      </div>

      {/* Info */}
      <CardContent className="p-4">
        <h3 className="font-bold text-card-foreground text-base mb-2 leading-snug line-clamp-1 font-display">
          {trip.name}
        </h3>
        <div className="flex items-center gap-1.5 mb-1.5">
          <MapPin size={12} className="text-primary flex-shrink-0" />
          <span className="text-sm text-muted-foreground truncate">{trip.destination}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Calendar size={12} className="text-muted-foreground flex-shrink-0" />
          <span className="text-xs text-muted-foreground">{formatDateRange(trip.start_date, trip.end_date)}</span>
        </div>
      </CardContent>
    </Card>
  )
}
