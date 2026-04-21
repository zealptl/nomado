import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, UserPlus, MapPin, Calendar } from 'lucide-react'
import AppHeader from '../components/AppHeader'
import SegmentNav from '../components/SegmentNav'
import DaySection from '../components/DaySection'
import SegmentModal from '../components/SegmentModal'
import InviteModal from '../components/InviteModal'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { tripsApi, segmentsApi, itemsApi, tagsApi } from '../lib/api'
import { useAuth } from '../hooks/useAuth'
import type { Trip, TripSegment, ItineraryItem } from '../types'

function eachDay(start: string, end: string): string[] {
  const days: string[] = []
  const d = new Date(start + 'T00:00:00')
  const e = new Date(end + 'T00:00:00')
  while (d <= e) {
    days.push(d.toISOString().slice(0, 10))
    d.setDate(d.getDate() + 1)
  }
  return days
}

function formatDateRange(start: string, end: string): string {
  const s = new Date(start + 'T00:00:00')
  const e = new Date(end + 'T00:00:00')
  const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  return `${fmt(s)} – ${fmt(e)}`
}

export default function TripDetailPage() {
  const { id: tripId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [trip, setTrip] = useState<Trip | null>(null)
  const [segments, setSegments] = useState<TripSegment[]>([])
  const [itemsByDate, setItemsByDate] = useState<Record<string, ItineraryItem[]>>({})
  const [availableTags, setAvailableTags] = useState<{ id: string | null; name: string; isDefault: boolean }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeDay, setActiveDay] = useState<string | null>(null)
  const [mobileTab, setMobileTab] = useState<'overview' | 'days'>('days')

  const [segmentModalOpen, setSegmentModalOpen] = useState(false)
  const [editingSegment, setEditingSegment] = useState<TripSegment | null>(null)
  const [segmentSubmitting, setSegmentSubmitting] = useState(false)
  const [segmentError, setSegmentError] = useState<string | null>(null)
  const [inviteModalOpen, setInviteModalOpen] = useState(false)

  const daySectionRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    if (!tripId) return
    Promise.all([
      tripsApi.get(tripId),
      segmentsApi.list(tripId),
      itemsApi.list(tripId),
      tagsApi.list(tripId),
    ]).then(([t, segs, items, tags]) => {
      setTrip(t)
      setSegments(segs)
      setItemsByDate(items)
      setAvailableTags(tags)
    }).catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [tripId])

  useEffect(() => {
    if (!trip) return
    observerRef.current?.disconnect()

    const observer = new IntersectionObserver(
      entries => {
        const visible = entries.filter(e => e.isIntersecting)
        if (visible.length > 0) {
          const topEntry = visible.reduce((a, b) =>
            a.boundingClientRect.top < b.boundingClientRect.top ? a : b
          )
          setActiveDay((topEntry.target as HTMLElement).dataset.day ?? null)
        }
      },
      { threshold: 0.2 }
    )

    Object.values(daySectionRefs.current).forEach(el => {
      if (el) observer.observe(el)
    })

    observerRef.current = observer
    return () => observer.disconnect()
  }, [trip, Object.keys(itemsByDate).join(',')])

  const setDayRef = useCallback((date: string) => (el: HTMLDivElement | null) => {
    daySectionRefs.current[date] = el
  }, [])

  function scrollToDay(date: string) {
    daySectionRefs.current[date]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function handleItemsChange(date: string, items: ItineraryItem[]) {
    setItemsByDate(prev => ({ ...prev, [date]: items }))
  }

  async function handleAddSegment(data: { title: string; start_date: string; end_date: string }) {
    if (!tripId) return
    setSegmentSubmitting(true)
    setSegmentError(null)
    try {
      const seg = await segmentsApi.create(tripId, data)
      setSegments(prev => [...prev, seg].sort((a, b) => a.start_date.localeCompare(b.start_date)))
      setSegmentModalOpen(false)
    } catch (e: any) {
      setSegmentError(e.message)
    } finally {
      setSegmentSubmitting(false)
    }
  }

  async function handleEditSegment(data: { title: string; start_date: string; end_date: string }) {
    if (!tripId || !editingSegment) return
    setSegmentSubmitting(true)
    setSegmentError(null)
    try {
      const updated = await segmentsApi.update(tripId, editingSegment.id, data)
      setSegments(prev => prev.map(s => s.id === updated.id ? updated : s).sort((a, b) => a.start_date.localeCompare(b.start_date)))
      setEditingSegment(null)
    } catch (e: any) {
      setSegmentError(e.message)
    } finally {
      setSegmentSubmitting(false)
    }
  }

  async function handleDeleteSegment(seg: TripSegment) {
    if (!tripId) return
    await segmentsApi.delete(tripId, seg.id)
    setSegments(prev => prev.filter(s => s.id !== seg.id))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            <p className="text-muted-foreground text-sm">Loading trip…</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !trip) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] gap-4">
          <p className="text-destructive text-sm">{error ?? 'Trip not found'}</p>
          <Button variant="secondary" onClick={() => navigate('/dashboard')}>
            <ArrowLeft size={15} />
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  const allDays = eachDay(trip.start_date, trip.end_date)
  const isOwner = user?.id === trip.owner_id

  const sidebar = (
    <div className="w-72 flex-shrink-0 bg-card border-r border-border overflow-y-auto h-[calc(100vh-64px)] sticky top-16 flex flex-col">
      <div className="p-4 border-b border-border">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary mb-3 transition-colors cursor-pointer bg-transparent border-0 p-0 font-sans"
          aria-label="Back to dashboard"
        >
          <ArrowLeft size={13} />
          All trips
        </button>

        {trip.cover_image_url && (
          <div className="h-20 rounded-xl overflow-hidden mb-3">
            <img src={trip.cover_image_url} alt={trip.name} className="w-full h-full object-cover" />
          </div>
        )}

        <h2 className="font-bold text-card-foreground text-base leading-snug mb-1 font-display">
          {trip.name}
        </h2>
        <div className="flex items-center gap-1.5 mb-0.5">
          <MapPin size={12} className="text-primary" />
          <span className="text-xs text-muted-foreground">{trip.destination}</span>
        </div>
        <div className="flex items-center gap-1.5 mb-3">
          <Calendar size={12} className="text-muted-foreground" />
          <span className="text-xs text-muted-foreground">{formatDateRange(trip.start_date, trip.end_date)}</span>
        </div>

        <Separator className="mb-3" />

        {isOwner && (
          <Button
            variant="default"
            size="sm"
            onClick={() => setInviteModalOpen(true)}
            className="w-full gap-2"
          >
            <UserPlus size={14} />
            Invite collaborators
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        <SegmentNav
          segments={segments}
          allDays={allDays}
          activeDay={activeDay}
          onDayClick={date => { scrollToDay(date); setMobileTab('days') }}
          onAddSegment={() => { setEditingSegment(null); setSegmentError(null); setSegmentModalOpen(true) }}
          onEditSegment={seg => { setEditingSegment(seg); setSegmentError(null); setSegmentModalOpen(true) }}
          onDeleteSegment={handleDeleteSegment}
        />
      </div>
    </div>
  )

  const mainContent = (
    <div className="flex-1 overflow-y-auto min-w-0 bg-background">
      <div className="max-w-2xl mx-auto px-6 py-8 pb-24">
        {allDays.map(date => (
          <DaySection
            key={date}
            ref={setDayRef(date)}
            date={date}
            tripId={tripId!}
            items={itemsByDate[date] ?? []}
            availableTags={availableTags}
            onItemsChange={handleItemsChange}
          />
        ))}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader />

      {/* Desktop layout */}
      <div className="desktop-split flex flex-1 overflow-hidden">
        <style>{`
          @media (max-width: 1023px) {
            .desktop-split { display: none !important; }
            .mobile-tabs { display: flex !important; }
          }
          @media (min-width: 1024px) {
            .mobile-tabs { display: none !important; }
          }
        `}</style>
        {sidebar}
        {mainContent}
      </div>

      {/* Mobile tab layout */}
      <div className="mobile-tabs hidden flex-col flex-1 overflow-hidden">
        <div className="flex border-b border-border bg-card">
          {(['overview', 'days'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setMobileTab(tab)}
              className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer font-display bg-transparent ${
                mobileTab === tab
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab === 'overview' ? 'Overview' : 'Itinerary'}
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto">
          {mobileTab === 'overview' ? sidebar : mainContent}
        </div>
      </div>

      {segmentModalOpen && trip && (
        <SegmentModal
          tripStartDate={trip.start_date}
          tripEndDate={trip.end_date}
          initial={editingSegment ?? undefined}
          onClose={() => { setSegmentModalOpen(false); setEditingSegment(null) }}
          onSubmit={editingSegment ? handleEditSegment : handleAddSegment}
          submitting={segmentSubmitting}
          error={segmentError}
        />
      )}

      {inviteModalOpen && tripId && (
        <InviteModal tripId={tripId} onClose={() => setInviteModalOpen(false)} />
      )}
    </div>
  )
}
