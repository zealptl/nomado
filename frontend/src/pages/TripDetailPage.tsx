import { useParams } from 'react-router-dom';
import AppHeader from '../components/AppHeader';

export default function TripDetailPage() {
  const { id } = useParams<{ id: string }>();
  return (
    <div style={{ minHeight: '100vh' }}>
      <AppHeader />
      <main style={{ padding: '40px 24px', maxWidth: '1200px', margin: '0 auto' }}>
        <p style={{ color: 'var(--color-text-muted)' }}>Trip {id} — coming soon.</p>
      </main>
    </div>
  );
}
