import { useRef, useState } from 'react';
import { X, Image } from 'lucide-react';
import { tripsApi } from '../lib/api';
import { useImageUpload } from '../hooks/useImageUpload';
import type { Trip } from '../types';

interface CreateTripModalProps {
  onClose: () => void;
  onCreated: (trip: Trip) => void;
}

export default function CreateTripModal({ onClose, onCreated }: CreateTripModalProps) {
  const [name, setName] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState<string | undefined>();
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const { uploading: uploadingCover, upload: uploadCover } = useImageUpload();

  async function handleCoverFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverPreview(URL.createObjectURL(file));
    const url = await uploadCover(file, 'trip-covers');
    if (url) setCoverImageUrl(url);
    else setCoverPreview(null);
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Trip name is required';
    if (!destination.trim()) e.destination = 'Destination is required';
    if (!startDate) e.startDate = 'Start date is required';
    if (!endDate) e.endDate = 'End date is required';
    if (startDate && endDate && endDate < startDate) e.endDate = 'End date must be after start date';
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setSubmitting(true);
    try {
      const trip = await tripsApi.create({
        name: name.trim(),
        destination: destination.trim(),
        start_date: startDate,
        end_date: endDate,
        cover_image_url: coverImageUrl,
      });
      onCreated(trip);
    } catch (err: any) {
      setErrors({ submit: err.message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: '480px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '24px' }}>Create Trip</h2>
          <button
            onClick={onClose}
            className="btn-secondary"
            style={{ padding: '6px', borderRadius: '8px', border: 'none', background: 'transparent' }}
            aria-label="Close"
          >
            <X size={20} color="var(--color-text-muted)" />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Cover photo */}
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '6px' }}>
                Cover Photo <span style={{ fontWeight: 400, color: 'var(--color-text-muted)' }}>(optional)</span>
              </label>
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleCoverFileChange}
              />
              {coverPreview ? (
                <div style={{ position: 'relative', height: '120px', borderRadius: '10px', overflow: 'hidden' }}>
                  <img src={coverPreview} alt="Cover preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button
                    type="button"
                    onClick={() => { setCoverPreview(null); setCoverImageUrl(undefined); }}
                    style={{ position: 'absolute', top: '6px', right: '6px', background: 'rgba(44,26,14,0.7)', border: 'none', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}
                    aria-label="Remove cover photo"
                  >
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => coverInputRef.current?.click()}
                  disabled={uploadingCover}
                  style={{ width: '100%', padding: '20px', border: '1.5px dashed rgba(124,106,90,0.4)', borderRadius: '10px', background: 'rgba(255,255,255,0.5)', color: 'var(--color-text-muted)', cursor: uploadingCover ? 'default' : 'pointer', fontSize: '14px', fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  <Image size={16} />
                  {uploadingCover ? 'Uploading…' : 'Upload Cover Photo'}
                </button>
              )}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '6px' }}>
                Trip Name
              </label>
              <input
                className="input"
                type="text"
                placeholder="Summer in Europe"
                value={name}
                onChange={e => setName(e.target.value)}
              />
              {errors.name && <p style={{ color: 'var(--color-secondary)', fontSize: '13px', marginTop: '4px' }}>{errors.name}</p>}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '6px' }}>
                Destination
              </label>
              <input
                className="input"
                type="text"
                placeholder="Spain, France, Italy"
                value={destination}
                onChange={e => setDestination(e.target.value)}
              />
              {errors.destination && <p style={{ color: 'var(--color-secondary)', fontSize: '13px', marginTop: '4px' }}>{errors.destination}</p>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '6px' }}>
                  Start Date
                </label>
                <input
                  className="input"
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                />
                {errors.startDate && <p style={{ color: 'var(--color-secondary)', fontSize: '13px', marginTop: '4px' }}>{errors.startDate}</p>}
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '6px' }}>
                  End Date
                </label>
                <input
                  className="input"
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                />
                {errors.endDate && <p style={{ color: 'var(--color-secondary)', fontSize: '13px', marginTop: '4px' }}>{errors.endDate}</p>}
              </div>
            </div>

            {errors.submit && (
              <p style={{ color: 'var(--color-secondary)', fontSize: '13px' }}>{errors.submit}</p>
            )}

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
              <button type="button" className="btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? 'Creating…' : 'Create Trip'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
