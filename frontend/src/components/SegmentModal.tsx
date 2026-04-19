import { useState } from 'react';
import { X } from 'lucide-react';
import type { TripSegment } from '../types';

interface SegmentModalProps {
  tripStartDate: string;
  tripEndDate: string;
  initial?: TripSegment;
  onClose: () => void;
  onSubmit: (data: { title: string; start_date: string; end_date: string }) => Promise<void>;
  submitting?: boolean;
  error?: string | null;
}

export default function SegmentModal({
  tripStartDate,
  tripEndDate,
  initial,
  onClose,
  onSubmit,
  submitting,
  error,
}: SegmentModalProps) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [startDate, setStartDate] = useState(initial?.start_date ?? tripStartDate);
  const [endDate, setEndDate] = useState(initial?.end_date ?? tripEndDate);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = 'Title is required';
    if (!startDate) errs.startDate = 'Start date is required';
    if (!endDate) errs.endDate = 'End date is required';
    if (startDate && endDate && endDate < startDate) errs.endDate = 'End date must be on or after start date';
    if (startDate < tripStartDate || endDate > tripEndDate) errs.startDate = 'Dates must be within the trip range';
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    await onSubmit({ title: title.trim(), start_date: startDate, end_date: endDate });
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: '420px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '20px' }}>{initial ? 'Edit Segment' : 'Add Segment'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }} aria-label="Close">
            <X size={18} color="var(--color-text-muted)" />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '5px' }}>Segment Name</label>
              <input className="input" type="text" placeholder="e.g. Barcelona" value={title} onChange={e => setTitle(e.target.value)} />
              {errors.title && <p style={{ color: 'var(--color-secondary)', fontSize: '12px', marginTop: '3px' }}>{errors.title}</p>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '5px' }}>Start Date</label>
                <input className="input" type="date" min={tripStartDate} max={tripEndDate} value={startDate} onChange={e => setStartDate(e.target.value)} />
                {errors.startDate && <p style={{ color: 'var(--color-secondary)', fontSize: '12px', marginTop: '3px' }}>{errors.startDate}</p>}
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '5px' }}>End Date</label>
                <input className="input" type="date" min={tripStartDate} max={tripEndDate} value={endDate} onChange={e => setEndDate(e.target.value)} />
                {errors.endDate && <p style={{ color: 'var(--color-secondary)', fontSize: '12px', marginTop: '3px' }}>{errors.endDate}</p>}
              </div>
            </div>

            {error && <p style={{ color: 'var(--color-secondary)', fontSize: '13px' }}>{error}</p>}

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '4px' }}>
              <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? 'Saving…' : initial ? 'Save Changes' : 'Add Segment'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
