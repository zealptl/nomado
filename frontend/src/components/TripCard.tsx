import { MapPin, Calendar } from 'lucide-react'
import type { Trip } from '../types'

interface TripCardProps {
  trip: Trip
  onClick: () => void
}

const CARD_GRADIENTS = [
  'linear-gradient(135deg, #0369a1 0%, #0ea5e9 50%, #38bdf8 100%)',
  'linear-gradient(135deg, #0891b2 0%, #06b6d4 50%, #22d3ee 100%)',
  'linear-gradient(135deg, #0284c7 0%, #0ea5e9 40%, #f97316 100%)',
  'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 50%, #38bdf8 100%)',
  'linear-gradient(135deg, #0369a1 0%, #0284c7 40%, #06b6d4 100%)',
  'linear-gradient(135deg, #0891b2 0%, #38bdf8 50%, #7dd3fc 100%)',
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
    <div
      className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:shadow-slate-200/80 border border-slate-100 transition-all duration-300 cursor-pointer hover:-translate-y-1"
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
            <span
              className="text-white/90 text-3xl font-extrabold tracking-tight leading-none"
              style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
            >
              {trip.name.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase()).join('')}
            </span>
          </div>
        )}
        {/* Days badge */}
        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm rounded-full px-2.5 py-1 text-xs font-semibold text-slate-600 shadow-sm">
          {days} {days === 1 ? 'day' : 'days'}
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-bold text-slate-900 text-base mb-2 leading-snug line-clamp-1" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          {trip.name}
        </h3>
        <div className="flex items-center gap-1.5 mb-1.5">
          <MapPin size={12} className="text-sky-500 flex-shrink-0" />
          <span className="text-sm text-slate-500 truncate">{trip.destination}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Calendar size={12} className="text-slate-400 flex-shrink-0" />
          <span className="text-xs text-slate-400">{formatDateRange(trip.start_date, trip.end_date)}</span>
        </div>
      </div>
    </div>
  )
}
