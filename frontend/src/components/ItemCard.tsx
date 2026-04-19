import { useState } from 'react';
import { MapPin, Clock, ExternalLink, ChevronDown, ChevronUp, Pencil, Trash2 } from 'lucide-react';
import type { ItineraryItem } from '../types';

interface ItemCardProps {
  item: ItineraryItem & { item_photos?: { id: string; storage_url: string }[] };
  onEdit: () => void;
  onDelete: () => void;
}

function formatTime(t: string | null) {
  if (!t) return null;
  const [h, m] = t.split(':');
  const hour = parseInt(h);
  const ampm = hour >= 12 ? 'pm' : 'am';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${m}${ampm}`;
}

export default function ItemCard({ item, onEdit, onDelete }: ItemCardProps) {
  const [photosExpanded, setPhotosExpanded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const photos = item.item_photos ?? [];
  const timeStr = item.time_start
    ? item.time_end
      ? `${formatTime(item.time_start)} – ${formatTime(item.time_end)}`
      : formatTime(item.time_start)
    : null;

  return (
    <div className="glass-card" style={{ padding: '16px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h4 style={{ fontSize: '16px', marginBottom: '6px', fontWeight: 600 }}>{item.title}</h4>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: item.description ? '8px' : '0' }}>
            {item.location && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: 'var(--color-text-muted)' }}>
                <MapPin size={12} />
                {item.maps_url ? (
                  <a href={item.maps_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>
                    {item.location}
                    <ExternalLink size={10} style={{ marginLeft: '3px', display: 'inline' }} />
                  </a>
                ) : item.location}
              </span>
            )}
            {timeStr && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: 'var(--color-text-muted)' }}>
                <Clock size={12} />
                {timeStr}
              </span>
            )}
          </div>

          {item.description && (
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '8px', lineHeight: 1.5 }}>
              {item.description}
            </p>
          )}

          {item.tags.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '8px' }}>
              {item.tags.map(tag => (
                <span key={tag} className="pill" style={{ fontSize: '11px', padding: '2px 8px', cursor: 'default' }}>{tag}</span>
              ))}
            </div>
          )}

          {photos.length > 0 && (
            <button
              type="button"
              onClick={() => setPhotosExpanded(e => !e)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--color-primary)', padding: 0 }}
              aria-label={photosExpanded ? 'Hide photos' : 'Show photos'}
            >
              {photosExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              {photos.length} photo{photos.length !== 1 ? 's' : ''}
            </button>
          )}

          {photosExpanded && photos.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
              {photos.map(p => (
                <img
                  key={p.id}
                  src={p.storage_url}
                  alt=""
                  style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }}
                />
              ))}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
          <button
            className="btn-secondary"
            style={{ padding: '6px', borderRadius: '8px', fontSize: '12px' }}
            onClick={onEdit}
            aria-label="Edit item"
          >
            <Pencil size={14} />
          </button>
          {confirmDelete ? (
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
              <button
                className="btn-primary"
                style={{ padding: '5px 10px', fontSize: '12px', background: '#C67B5C' }}
                onClick={onDelete}
                aria-label="Confirm delete"
              >
                Delete
              </button>
              <button
                className="btn-secondary"
                style={{ padding: '5px 8px', fontSize: '12px' }}
                onClick={() => setConfirmDelete(false)}
                aria-label="Cancel delete"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              className="btn-secondary"
              style={{ padding: '6px', borderRadius: '8px', fontSize: '12px' }}
              onClick={() => setConfirmDelete(true)}
              aria-label="Delete item"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
