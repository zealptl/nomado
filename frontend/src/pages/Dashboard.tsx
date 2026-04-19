import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Compass, Users } from 'lucide-react'
import AppHeader from '../components/AppHeader'
import TripCard from '../components/TripCard'
import CreateTripModal from '../components/CreateTripModal'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { tripsApi } from '../lib/api'
import { useAuth } from '../hooks/useAuth'
import type { Trip } from '../types'

function TripGrid({ trips, onTripClick }: { trips: Trip[]; onTripClick: (id: string) => void }) {
  return (
    <div className="grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
      {trips.map(trip => (
        <TripCard key={trip.id} trip={trip} onClick={() => onTripClick(trip.id)} />
      ))}
    </div>
  )
}

function LoadingGrid() {
  return (
    <div className="grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
      {[1, 2, 3].map(i => (
        <div key={i} className="bg-white rounded-2xl overflow-hidden border border-slate-100">
          <Skeleton className="h-48 w-full rounded-none" />
          <div className="p-4 flex flex-col gap-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyMyTrips({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center bg-white rounded-2xl border-2 border-dashed border-slate-200">
      <div className="w-14 h-14 rounded-2xl bg-sky-50 flex items-center justify-center mb-4">
        <Compass size={24} className="text-sky-500" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-1" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
        No trips yet
      </h3>
      <p className="text-slate-400 text-sm mb-6 max-w-xs">
        Plan your first adventure — add destinations, schedule days, and invite friends.
      </p>
      <Button variant="cta" onClick={onCreateClick}>
        <Plus size={16} />
        Create your first trip
      </Button>
    </div>
  )
}

function EmptySharedTrips() {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-6 text-center bg-white rounded-2xl border-2 border-dashed border-slate-200">
      <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center mb-3">
        <Users size={20} className="text-slate-400" />
      </div>
      <p className="text-slate-400 text-sm">
        Trips shared with you will appear here.
      </p>
    </div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [myTrips, setMyTrips] = useState<Trip[]>([])
  const [sharedTrips, setSharedTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)

  useEffect(() => {
    Promise.all([tripsApi.list(), tripsApi.listShared()])
      .then(([mine, shared]) => {
        setMyTrips(mine)
        setSharedTrips(shared)
      })
      .finally(() => setLoading(false))
  }, [])

  function handleTripCreated(trip: Trip) {
    setMyTrips(prev => [trip, ...prev])
    setShowCreate(false)
    navigate(`/trips/${trip.id}`)
  }

  const firstName = user?.email?.split('@')[0] ?? 'there'

  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader />

      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Page header */}
        <div className="mb-10">
          <p className="text-sky-500 text-sm font-semibold uppercase tracking-widest mb-1">Dashboard</p>
          <h1
            className="text-4xl font-extrabold text-slate-900 tracking-tight"
            style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
          >
            Hey, {firstName} 👋
          </h1>
          <p className="text-slate-400 mt-1 text-base">Where to next?</p>
        </div>

        {loading ? (
          <div className="flex flex-col gap-12">
            <section>
              <div className="flex items-center justify-between mb-6">
                <Skeleton className="h-7 w-32" />
                <Skeleton className="h-10 w-28" />
              </div>
              <LoadingGrid />
            </section>
          </div>
        ) : (
          <div className="flex flex-col gap-12">
            {/* My Trips */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                    My Trips
                  </h2>
                  {myTrips.length > 0 && (
                    <p className="text-slate-400 text-sm mt-0.5">{myTrips.length} {myTrips.length === 1 ? 'trip' : 'trips'}</p>
                  )}
                </div>
                {myTrips.length > 0 && (
                  <Button variant="primary" onClick={() => setShowCreate(true)}>
                    <Plus size={16} />
                    New Trip
                  </Button>
                )}
              </div>
              {myTrips.length === 0 ? (
                <EmptyMyTrips onCreateClick={() => setShowCreate(true)} />
              ) : (
                <TripGrid trips={myTrips} onTripClick={id => navigate(`/trips/${id}`)} />
              )}
            </section>

            {/* Shared with Me */}
            {sharedTrips.length > 0 && (
              <section>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                    Shared with Me
                  </h2>
                  <p className="text-slate-400 text-sm mt-0.5">{sharedTrips.length} {sharedTrips.length === 1 ? 'trip' : 'trips'}</p>
                </div>
                <TripGrid trips={sharedTrips} onTripClick={id => navigate(`/trips/${id}`)} />
              </section>
            )}

            {sharedTrips.length === 0 && myTrips.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-6" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  Shared with Me
                </h2>
                <EmptySharedTrips />
              </section>
            )}
          </div>
        )}
      </main>

      {showCreate && (
        <CreateTripModal
          onClose={() => setShowCreate(false)}
          onCreated={handleTripCreated}
        />
      )}
    </div>
  )
}
