import { useState } from 'react';
import { X } from 'lucide-react';
import PhotoUploader from './PhotoUploader';
import type { ItineraryItem } from '../types';

interface Tag {
  id: string | null;
  name: string;
  isDefault: boolean;
}

interface ItemFormModalProps {
  initialDate: string;
  initial?: Partial<ItineraryItem> & { photos?: string[] };
  availableTags: Tag[];
  title: string;
  onClose: () => void;
  onSubmit: (data: Partial<ItineraryItem> & { photos?: string[] }) => Promise<void>;
  submitting?: boolean;
  error?: string | null;
}

export default function ItemFormModal({
  initialDate,
  initial,
  availableTags,
  title,
  onClose,
  onSubmit,
  submitting,
  error,
}: ItemFormModalProps) {
  const [itemTitle, setItemTitle] = useState(initial?.title ?? '');
  const [location, setLocation] = useState(initial?.location ?? '');
  const [mapsUrl, setMapsUrl] = useState(initial?.maps_url ?? '');
  const [timeStart, setTimeStart] = useState(initial?.time_start ?? '');
  const [timeEnd, setTimeEnd] = useState(initial?.time_end ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [tags, setTags] = useState<string[]>(initial?.tags ?? []);
  const [photos, setPhotos] = useState<string[]>(initial?.photos ?? []);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function toggleTag(name: string) {
    setTags(prev => prev.includes(name) ? prev.filter(t => t !== name) : [...prev, name]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!itemTitle.trim()) errs.title = 'Title is required';
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    await onSubmit({
      date: initialDate,
      title: itemTitle.trim(),
      location: location.trim() || null,
      maps_url: mapsUrl.trim() || null,
      time_start: timeStart || null,
      time_end: timeEnd || null,
      description: description.trim() || null,
      tags,
      photos,
    });
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: '540px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '22px' }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }} aria-label="Close">
            <X size={20} color="var(--color-text-muted)" />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '5px' }}>Title *</label>
              <input className="input" type="text" placeholder="e.g. Sagrada Família" value={itemTitle} onChange={e => setItemTitle(e.target.value)} />
              {errors.title && <p style={{ color: 'var(--color-secondary)', fontSize: '12px', marginTop: '3px' }}>{errors.title}</p>}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '5px' }}>Location</label>
              <input className="input" type="text" placeholder="e.g. Barcelona, Spain" value={location} onChange={e => setLocation(e.target.value)} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '5px' }}>Maps Link</label>
              <input className="input" type="url" placeholder="https://maps.google.com/..." value={mapsUrl} onChange={e => setMapsUrl(e.target.value)} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '5px' }}>Start Time</label>
                <input className="input" type="time" value={timeStart} onChange={e => setTimeStart(e.target.value)} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '5px' }}>End Time</label>
                <input className="input" type="time" value={timeEnd} onChange={e => setTimeEnd(e.target.value)} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '5px' }}>Description</label>
              <textarea
                className="input"
                placeholder="Notes, reservations, things to know…"
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={3}
                style={{ resize: 'vertical' }}
              />
            </div>

            {availableTags.length > 0 && (
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>Tags</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {availableTags.map(tag => (
                    <button
                      key={tag.name}
                      type="button"
                      className={`pill${tags.includes(tag.name) ? ' active' : ''}`}
                      onClick={() => toggleTag(tag.name)}
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>Photos</label>
              <PhotoUploader onPhotosChange={setPhotos} />
            </div>

            {error && <p style={{ color: 'var(--color-secondary)', fontSize: '13px' }}>{error}</p>}

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
              <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
