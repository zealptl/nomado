import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, UserPlus } from 'lucide-react';
import AppHeader from '../components/AppHeader';
import SegmentNav from '../components/SegmentNav';
import DaySection from '../components/DaySection';
import SegmentModal from '../components/SegmentModal';
import InviteModal from '../components/InviteModal';
import { tripsApi, segmentsApi, itemsApi, tagsApi } from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import type { Trip, TripSegment, ItineraryItem } from '../types';

function eachDay(start: string, end: string): string[] {
  const days: string[] = [];
  const d = new Date(start + 'T00:00:00');
  const e = new Date(end + 'T00:00:00');
  while (d <= e) {
    days.push(d.toISOString().slice(0, 10));
    d.setDate(d.getDate() + 1);
  }
  return days;
}

export default function TripDetailPage() {
  const { id: tripId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [segments, setSegments] = useState<TripSegment[]>([]);
  const [itemsByDate, setItemsByDate] = useState<Record<string, ItineraryItem[]>>({});
  const [availableTags, setAvailableTags] = useState<{ id: string | null; name: string; isDefault: boolean }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeDay, setActiveDay] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<'overview' | 'days'>('days');

  const [segmentModalOpen, setSegmentModalOpen] = useState(false);
  const [editingSegment, setEditingSegment] = useState<TripSegment | null>(null);
  const [segmentSubmitting, setSegmentSubmitting] = useState(false);
  const [segmentError, setSegmentError] = useState<string | null>(null);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  const daySectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const rightPanelRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (!tripId) return;
    Promise.all([
      tripsApi.get(tripId),
      segmentsApi.list(tripId),
      itemsApi.list(tripId),
      tagsApi.list(tripId),
    ]).then(([t, segs, items, tags]) => {
      setTrip(t);
      setSegments(segs);
      setItemsByDate(items);
      setAvailableTags(tags);
    }).catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [tripId]);

  // IntersectionObserver for active day highlight
  useEffect(() => {
    if (!trip) return;
    observerRef.current?.disconnect();

    const observer = new IntersectionObserver(
      entries => {
        const visible = entries.filter(e => e.isIntersecting);
        if (visible.length > 0) {
          const topEntry = visible.reduce((a, b) =>
            a.boundingClientRect.top < b.boundingClientRect.top ? a : b
          );
          setActiveDay((topEntry.target as HTMLElement).dataset.day ?? null);
        }
      },
      { threshold: 0.2 }
    );

    Object.values(daySectionRefs.current).forEach(el => {
      if (el) observer.observe(el);
    });

    observerRef.current = observer;
    return () => observer.disconnect();
  }, [trip, Object.keys(itemsByDate).join(',')]);

  const setDayRef = useCallback((date: string) => (el: HTMLDivElement | null) => {
    daySectionRefs.current[date] = el;
  }, []);

  function scrollToDay(date: string) {
    daySectionRefs.current[date]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function handleItemsChange(date: string, items: ItineraryItem[]) {
    setItemsByDate(prev => ({ ...prev, [date]: items }));
  }

  async function handleAddSegment(data: { title: string; start_date: string; end_date: string }) {
    if (!tripId) return;
    setSegmentSubmitting(true);
    setSegmentError(null);
    try {
      const seg = await segmentsApi.create(tripId, data);
      setSegments(prev => [...prev, seg].sort((a, b) => a.start_date.localeCompare(b.start_date)));
      setSegmentModalOpen(false);
    } catch (e: any) {
      setSegmentError(e.message);
    } finally {
      setSegmentSubmitting(false);
    }
  }

  async function handleEditSegment(data: { title: string; start_date: string; end_date: string }) {
    if (!tripId || !editingSegment) return;
    setSegmentSubmitting(true);
    setSegmentError(null);
    try {
      const updated = await segmentsApi.update(tripId, editingSegment.id, data);
      setSegments(prev => prev.map(s => s.id === updated.id ? updated : s).sort((a, b) => a.start_date.localeCompare(b.start_date)));
      setEditingSegment(null);
    } catch (e: any) {
      setSegmentError(e.message);
    } finally {
      setSegmentSubmitting(false);
    }
  }

  async function handleDeleteSegment(seg: TripSegment) {
    if (!tripId) return;
    await segmentsApi.delete(tripId, seg.id);
    setSegments(prev => prev.filter(s => s.id !== seg.id));
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh' }}>
        <AppHeader />
        <p style={{ padding: '48px 24px', color: 'var(--color-text-muted)', textAlign: 'center' }}>Loading…</p>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div style={{ minHeight: '100vh' }}>
        <AppHeader />
        <div style={{ padding: '48px 24px', textAlign: 'center' }}>
          <p style={{ color: 'var(--color-secondary)', marginBottom: '16px' }}>{error ?? 'Trip not found'}</p>
          <button className="btn-secondary" onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
        </div>
      </div>
    );
  }

  const allDays = eachDay(trip.start_date, trip.end_date);
  const isOwner = user?.id === trip.owner_id;

  const leftPanel = (
    <div style={{
      width: '280px',
      flexShrink: 0,
      background: 'rgba(255,255,255,0.6)',
      backdropFilter: 'blur(15px)',
      WebkitBackdropFilter: 'blur(15px)',
      borderRight: '1px solid rgba(255,255,255,0.3)',
      overflowY: 'auto',
      height: 'calc(100vh - 64px)',
      position: 'sticky',
      top: '64px',
    }}>
      <div style={{ padding: '20px 16px 12px', borderBottom: '1px solid rgba(255,255,255,0.3)' }}>
        <button
          onClick={() => navigate('/dashboard')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--color-text-muted)', padding: '0 0 12px', fontFamily: 'Inter, sans-serif' }}
          aria-label="Back to dashboard"
        >
          <ArrowLeft size={14} /> Dashboard
        </button>
        <h2 style={{ fontSize: '18px', marginBottom: '4px' }}>{trip.name}</h2>
        <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>{trip.destination}</p>
        {isOwner && (
          <button
            className="btn-primary"
            style={{ marginTop: '12px', fontSize: '12px', padding: '6px 12px' }}
            onClick={() => setInviteModalOpen(true)}
          >
            <UserPlus size={13} />
            Invite
          </button>
        )}
      </div>

      <SegmentNav
        segments={segments}
        allDays={allDays}
        activeDay={activeDay}
        onDayClick={date => { scrollToDay(date); setMobileTab('days'); }}
        onAddSegment={() => { setEditingSegment(null); setSegmentError(null); setSegmentModalOpen(true); }}
        onEditSegment={seg => { setEditingSegment(seg); setSegmentError(null); setSegmentModalOpen(true); }}
        onDeleteSegment={handleDeleteSegment}
      />
    </div>
  );

  const rightPanel = (
    <div
      ref={rightPanelRef}
      style={{ flex: 1, padding: '32px 32px 80px', overflowY: 'auto', minWidth: 0 }}
    >
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
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppHeader />

      {/* Desktop layout */}
      <div className="desktop-split" style={{ display: 'flex', flex: 1 }}>
        <style>{`
          @media (max-width: 1023px) {
            .desktop-split { display: none !important; }
            .mobile-tabs { display: flex !important; }
          }
          @media (min-width: 1024px) {
            .mobile-tabs { display: none !important; }
          }
        `}</style>
        {leftPanel}
        {rightPanel}
      </div>

      {/* Mobile tab layout */}
      <div className="mobile-tabs" style={{ display: 'none', flexDirection: 'column', flex: 1 }}>
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(124,106,90,0.15)', background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(10px)' }}>
          {(['overview', 'days'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setMobileTab(tab)}
              style={{
                flex: 1,
                padding: '12px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                fontWeight: mobileTab === tab ? 600 : 400,
                color: mobileTab === tab ? 'var(--color-primary)' : 'var(--color-text-muted)',
                borderBottom: mobileTab === tab ? '2px solid var(--color-primary)' : '2px solid transparent',
                transition: 'all 150ms ease',
              }}
            >
              {tab === 'overview' ? 'Overview' : 'Days'}
            </button>
          ))}
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {mobileTab === 'overview' ? leftPanel : rightPanel}
        </div>
      </div>

      {/* Segment modal */}
      {segmentModalOpen && trip && (
        <SegmentModal
          tripStartDate={trip.start_date}
          tripEndDate={trip.end_date}
          initial={editingSegment ?? undefined}
          onClose={() => { setSegmentModalOpen(false); setEditingSegment(null); }}
          onSubmit={editingSegment ? handleEditSegment : handleAddSegment}
          submitting={segmentSubmitting}
          error={segmentError}
        />
      )}

      {/* Invite modal */}
      {inviteModalOpen && tripId && (
        <InviteModal tripId={tripId} onClose={() => setInviteModalOpen(false)} />
      )}
    </div>
  );
}
