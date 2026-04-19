import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, MapPin } from 'lucide-react';
import AppHeader from '../components/AppHeader';
import TripCard from '../components/TripCard';
import CreateTripModal from '../components/CreateTripModal';
import { tripsApi } from '../lib/api';
import type { Trip } from '../types';

function EmptyMyTrips({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 24px',
      textAlign: 'center',
      gap: '16px',
      background: 'rgba(255,255,255,0.4)',
      borderRadius: '16px',
      border: '2px dashed rgba(124,106,90,0.2)',
    }}>
      <MapPin size={40} color="var(--color-accent)" strokeWidth={1.5} />
      <div>
        <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>No trips yet</h3>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', marginBottom: '20px' }}>
          Plan your first adventure and start adding destinations, days, and memories.
        </p>
        <button className="btn-primary" onClick={onCreateClick}>
          <Plus size={16} />
          Create your first trip
        </button>
      </div>
    </div>
  );
}

function EmptySharedTrips() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
      textAlign: 'center',
      background: 'rgba(255,255,255,0.4)',
      borderRadius: '16px',
      border: '2px dashed rgba(124,106,90,0.2)',
    }}>
      <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>
        Trips shared with you will appear here.
      </p>
    </div>
  );
}

function TripGrid({ trips, onTripClick }: { trips: Trip[]; onTripClick: (id: string) => void }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
      gap: '20px',
    }}>
      {trips.map(trip => (
        <TripCard key={trip.id} trip={trip} onClick={() => onTripClick(trip.id)} />
      ))}
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [myTrips, setMyTrips] = useState<Trip[]>([]);
  const [sharedTrips, setSharedTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    Promise.all([tripsApi.list(), tripsApi.listShared()])
      .then(([mine, shared]) => {
        setMyTrips(mine);
        setSharedTrips(shared);
      })
      .finally(() => setLoading(false));
  }, []);

  function handleTripCreated(trip: Trip) {
    setMyTrips(prev => [trip, ...prev]);
    setShowCreate(false);
    navigate(`/trips/${trip.id}`);
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <AppHeader />
      <main style={{ padding: '40px 24px', maxWidth: '1200px', margin: '0 auto' }}>
        {loading ? (
          <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', paddingTop: '80px' }}>
            Loading trips…
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
            {/* My Trips */}
            <section>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <h1 style={{ fontSize: '28px' }}>My Trips</h1>
                {myTrips.length > 0 && (
                  <button className="btn-primary" onClick={() => setShowCreate(true)}>
                    <Plus size={16} />
                    New Trip
                  </button>
                )}
              </div>
              {myTrips.length === 0 ? (
                <EmptyMyTrips onCreateClick={() => setShowCreate(true)} />
              ) : (
                <TripGrid trips={myTrips} onTripClick={id => navigate(`/trips/${id}`)} />
              )}
            </section>

            {/* Shared with Me */}
            <section>
              <h2 style={{ fontSize: '24px', marginBottom: '24px' }}>Shared with Me</h2>
              {sharedTrips.length === 0 ? (
                <EmptySharedTrips />
              ) : (
                <TripGrid trips={sharedTrips} onTripClick={id => navigate(`/trips/${id}`)} />
              )}
            </section>
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
  );
}
