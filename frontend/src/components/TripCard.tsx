import type { Trip } from '../types';

interface TripCardProps {
  trip: Trip;
  onClick: () => void;
}

function formatDateRange(start: string, end: string): string {
  const s = new Date(start + 'T00:00:00');
  const e = new Date(end + 'T00:00:00');
  const fmt = (d: Date) =>
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return `${fmt(s)} – ${fmt(e)}`;
}

function TripInitials({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('');
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: 'linear-gradient(135deg, #D4C4A8 0%, #5C7A5F 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '28px',
        fontFamily: 'Playfair Display, serif',
        fontWeight: 700,
        color: 'white',
      }}
    >
      {initials}
    </div>
  );
}

export default function TripCard({ trip, onClick }: TripCardProps) {
  return (
    <div
      className="card"
      onClick={onClick}
      style={{ padding: 0, overflow: 'hidden' }}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick()}
      aria-label={`Open trip: ${trip.name}`}
    >
      <div style={{ height: '160px', overflow: 'hidden' }}>
        {trip.cover_image_url ? (
          <img
            src={trip.cover_image_url}
            alt={trip.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <TripInitials name={trip.name} />
        )}
      </div>
      <div style={{ padding: '16px 20px 20px' }}>
        <h3 style={{ fontSize: '18px', marginBottom: '4px' }}>{trip.name}</h3>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', marginBottom: '6px' }}>
          {trip.destination}
        </p>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>
          {formatDateRange(trip.start_date, trip.end_date)}
        </p>
      </div>
    </div>
  );
}
