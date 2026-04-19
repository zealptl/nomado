import { Plus, Pencil, Trash2 } from 'lucide-react';
import type { TripSegment } from '../types';

interface DayEntry {
  date: string;
  badge?: 'checkout' | 'checkin';
}

interface SegmentGroup {
  segment: TripSegment;
  days: DayEntry[];
}

interface SegmentNavProps {
  segments: TripSegment[];
  allDays: string[];
  activeDay: string | null;
  onDayClick: (date: string) => void;
  onAddSegment: () => void;
  onEditSegment: (seg: TripSegment) => void;
  onDeleteSegment: (seg: TripSegment) => void;
}

function formatNavDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function buildSegmentGroups(segments: TripSegment[], allDays: string[]): { groups: SegmentGroup[]; unassignedDays: string[] } {
  if (segments.length === 0) return { groups: [], unassignedDays: allDays };

  const sorted = [...segments].sort((a, b) => a.start_date.localeCompare(b.start_date));
  const groups: SegmentGroup[] = [];

  for (let si = 0; si < sorted.length; si++) {
    const seg = sorted[si];
    const prevSeg = sorted[si - 1];
    const nextSeg = sorted[si + 1];
    const days: DayEntry[] = [];

    for (const day of allDays) {
      if (day >= seg.start_date && day <= seg.end_date) {
        let badge: 'checkout' | 'checkin' | undefined;
        if (nextSeg && day === seg.end_date && day === nextSeg.start_date) badge = 'checkout';
        else if (prevSeg && day === seg.start_date && day === prevSeg.end_date) badge = 'checkin';
        days.push({ date: day, badge });
      }
    }

    groups.push({ segment: seg, days });
  }

  const assignedDays = new Set(groups.flatMap(g => g.days.map(d => d.date)));
  const unassignedDays = allDays.filter(d => !assignedDays.has(d));
  return { groups, unassignedDays };
}

export default function SegmentNav({
  segments,
  allDays,
  activeDay,
  onDayClick,
  onAddSegment,
  onEditSegment,
  onDeleteSegment,
}: SegmentNavProps) {
  const { groups, unassignedDays } = buildSegmentGroups(segments, allDays);

  function DayLink({ date, badge }: DayEntry) {
    const isActive = activeDay === date;
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 10px',
          borderRadius: '8px',
          cursor: 'pointer',
          transition: 'all 150ms ease',
          background: isActive ? 'rgba(92,122,95,0.12)' : 'transparent',
          borderLeft: isActive ? '3px solid #5C7A5F' : '3px solid transparent',
        }}
        onClick={() => onDayClick(date)}
        role="button"
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && onDayClick(date)}
      >
        <span style={{
          fontSize: '13px',
          color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
          fontFamily: 'Inter, sans-serif',
          fontWeight: isActive ? 500 : 400,
        }}>
          {formatNavDate(date)}
        </span>
        {badge === 'checkout' && (
          <span style={{ fontSize: '10px', padding: '1px 7px', borderRadius: '999px', background: 'rgba(198,123,92,0.12)', color: '#C67B5C', fontFamily: 'Inter, sans-serif' }}>
            checkout
          </span>
        )}
        {badge === 'checkin' && (
          <span style={{ fontSize: '10px', padding: '1px 7px', borderRadius: '999px', background: 'rgba(92,122,95,0.12)', color: '#5C7A5F', fontFamily: 'Inter, sans-serif' }}>
            checkin
          </span>
        )}
      </div>
    );
  }

  return (
    <div style={{ padding: '16px 8px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {groups.map(({ segment, days }) => (
        <div key={segment.id}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px', padding: '0 4px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text)' }}>{segment.title}</h4>
            <div style={{ display: 'flex', gap: '2px' }}>
              <button onClick={() => onEditSegment(segment)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '3px', color: 'var(--color-text-muted)', borderRadius: '4px' }} aria-label={`Edit segment ${segment.title}`}>
                <Pencil size={12} />
              </button>
              <button onClick={() => onDeleteSegment(segment)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '3px', color: 'var(--color-text-muted)', borderRadius: '4px' }} aria-label={`Delete segment ${segment.title}`}>
                <Trash2 size={12} />
              </button>
            </div>
          </div>
          {days.map(entry => <DayLink key={entry.date + (entry.badge ?? '')} {...entry} />)}
        </div>
      ))}

      {unassignedDays.length > 0 && (
        <div>
          {groups.length > 0 && (
            <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '6px', padding: '0 4px' }}>Unassigned</h4>
          )}
          {unassignedDays.map(date => <DayLink key={date} date={date} />)}
        </div>
      )}

      <button
        className="btn-secondary"
        style={{ fontSize: '13px', padding: '8px 12px', marginTop: '8px' }}
        onClick={onAddSegment}
      >
        <Plus size={14} />
        Add Segment
      </button>
    </div>
  );
}
