import { forwardRef, useState } from 'react';
import { Plus } from 'lucide-react';
import ItemCard from './ItemCard';
import ItemFormModal from './ItemFormModal';
import { itemsApi } from '../lib/api';
import type { ItineraryItem } from '../types';

interface Tag {
  id: string | null;
  name: string;
  isDefault: boolean;
}

interface DaySectionProps {
  date: string;
  tripId: string;
  items: (ItineraryItem & { item_photos?: { id: string; storage_url: string }[] })[];
  availableTags: Tag[];
  onItemsChange: (date: string, items: ItineraryItem[]) => void;
}

function formatDayHeader(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  const weekday = d.toLocaleDateString('en-US', { weekday: 'long' });
  const date = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  return { weekday, date };
}

const DaySection = forwardRef<HTMLDivElement, DaySectionProps>(
  function DaySection({ date, tripId, items, availableTags, onItemsChange }, ref) {
    const [activeTags, setActiveTags] = useState<string[]>([]);
    const [addOpen, setAddOpen] = useState(false);
    const [editItem, setEditItem] = useState<ItineraryItem | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [modalError, setModalError] = useState<string | null>(null);
    const [toastMsg, setToastMsg] = useState<string | null>(null);

    const tagsInDay = [...new Set(items.flatMap(i => i.tags))];
    const displayedItems = activeTags.length > 0
      ? items.filter(i => i.tags.some(t => activeTags.includes(t)))
      : items;

    function toggleTag(tag: string) {
      setActiveTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
    }

    function showToast(msg: string) {
      setToastMsg(msg);
      setTimeout(() => setToastMsg(null), 3000);
    }

    async function handleAddItem(data: Partial<ItineraryItem> & { photos?: string[] }) {
      setSubmitting(true);
      setModalError(null);
      try {
        const newItem = await itemsApi.create(tripId, { ...data, date } as any);
        onItemsChange(date, [...items, newItem]);
        setAddOpen(false);
      } catch (e: any) {
        setModalError(e.message);
      } finally {
        setSubmitting(false);
      }
    }

    async function handleEditItem(data: Partial<ItineraryItem> & { photos?: string[] }) {
      if (!editItem) return;
      setSubmitting(true);
      setModalError(null);
      try {
        const updated = await itemsApi.update(tripId, editItem.id, { ...data, updated_at: editItem.updated_at } as any);
        onItemsChange(date, items.map(i => i.id === updated.id ? updated : i));
        setEditItem(null);
      } catch (e: any) {
        if ((e as any).status === 409) {
          showToast('This item was updated by someone else. Please refresh.');
          setEditItem(null);
        } else {
          setModalError(e.message);
        }
      } finally {
        setSubmitting(false);
      }
    }

    async function handleDeleteItem(itemId: string) {
      await itemsApi.delete(tripId, itemId);
      onItemsChange(date, items.filter(i => i.id !== itemId));
    }

    const { weekday, date: dateLabel } = formatDayHeader(date);

    return (
      <div ref={ref} data-day={date} style={{ marginBottom: '40px' }}>
        {/* Toast */}
        {toastMsg && (
          <div style={{ position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)', background: '#2C1A0E', color: 'white', padding: '12px 20px', borderRadius: '10px', fontSize: '14px', zIndex: 100 }}>
            {toastMsg}
          </div>
        )}

        {/* Day header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '20px', marginBottom: '2px' }}>{weekday}</h3>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>{dateLabel}</p>
            {tagsInDay.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '8px' }}>
                {tagsInDay.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    className={`pill${activeTags.includes(tag) ? ' active' : ''}`}
                    style={{ fontSize: '11px' }}
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            className="btn-primary"
            style={{ padding: '8px 14px', fontSize: '13px', whiteSpace: 'nowrap', flexShrink: 0 }}
            onClick={() => setAddOpen(true)}
          >
            <Plus size={14} />
            Add Item
          </button>
        </div>

        {/* Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {displayedItems.length === 0 && (
            <div style={{ padding: '24px', textAlign: 'center', background: 'rgba(255,255,255,0.3)', borderRadius: '12px', border: '2px dashed rgba(124,106,90,0.15)' }}>
              <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                {activeTags.length > 0 ? 'No items match the selected tags.' : 'No items yet — click "Add Item" to start planning.'}
              </p>
            </div>
          )}
          {displayedItems.map(item => (
            <ItemCard
              key={item.id}
              item={item}
              onEdit={() => { setEditItem(item); setModalError(null); }}
              onDelete={() => handleDeleteItem(item.id)}
            />
          ))}
        </div>

        {/* Modals */}
        {addOpen && (
          <ItemFormModal
            initialDate={date}
            availableTags={availableTags}
            title="Add Item"
            onClose={() => setAddOpen(false)}
            onSubmit={handleAddItem}
            submitting={submitting}
            error={modalError}
          />
        )}
        {editItem && (
          <ItemFormModal
            initialDate={date}
            initial={editItem}
            availableTags={availableTags}
            title="Edit Item"
            onClose={() => setEditItem(null)}
            onSubmit={handleEditItem}
            submitting={submitting}
            error={modalError}
          />
        )}
      </div>
    );
  }
);

export default DaySection;
