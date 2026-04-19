import { forwardRef, useState } from 'react';
import { Plus } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
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

function computeNewPosition(items: ItineraryItem[], fromIndex: number, toIndex: number): number {
  const sorted = [...items].sort((a, b) => a.position - b.position);
  const before = sorted[toIndex - 1]?.position;
  const after = sorted[toIndex]?.position;

  if (before === undefined && after === undefined) return 1.0;
  if (before === undefined) return after! - 1.0;
  if (after === undefined) return before + 1.0;
  return (before + after) / 2;
}

function normalizePositions(items: ItineraryItem[]): ItineraryItem[] {
  const sorted = [...items].sort((a, b) => a.position - b.position);
  const minGap = sorted.reduce((min, item, i) => {
    if (i === 0) return min;
    return Math.min(min, item.position - sorted[i - 1].position);
  }, Infinity);

  if (minGap >= 0.001) return items;

  // Reset to 1.0, 2.0, 3.0...
  return sorted.map((item, i) => ({ ...item, position: i + 1 }));
}

function SortableItem({
  item,
  onEdit,
  onDelete,
}: {
  item: ItineraryItem & { item_photos?: { id: string; storage_url: string }[] };
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        cursor: 'grab',
      }}
      {...attributes}
      {...listeners}
    >
      <ItemCard item={item} onEdit={onEdit} onDelete={onDelete} />
    </div>
  );
}

const DaySection = forwardRef<HTMLDivElement, DaySectionProps>(
  function DaySection({ date, tripId, items, availableTags, onItemsChange }, ref) {
    const [activeTags, setActiveTags] = useState<string[]>([]);
    const [addOpen, setAddOpen] = useState(false);
    const [editItem, setEditItem] = useState<ItineraryItem | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [modalError, setModalError] = useState<string | null>(null);
    const [toastMsg, setToastMsg] = useState<string | null>(null);

    const sensors = useSensors(
      useSensor(PointerSensor),
      useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    );

    const sortedItems = [...items].sort((a, b) => a.position - b.position);
    const tagsInDay = [...new Set(sortedItems.flatMap(i => i.tags))];
    const displayedItems = activeTags.length > 0
      ? sortedItems.filter(i => i.tags.some(t => activeTags.includes(t)))
      : sortedItems;

    function toggleTag(tag: string) {
      setActiveTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
    }

    function showToast(msg: string) {
      setToastMsg(msg);
      setTimeout(() => setToastMsg(null), 3000);
    }

    async function handleDragEnd(event: DragEndEvent) {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const fromIndex = sortedItems.findIndex(i => i.id === active.id);
      const toIndex = sortedItems.findIndex(i => i.id === over.id);
      if (fromIndex === -1 || toIndex === -1) return;

      // Move the item in the list
      const reordered = [...sortedItems];
      const [moved] = reordered.splice(fromIndex, 1);
      reordered.splice(toIndex, 0, moved);

      // Compute new position for the moved item
      const newPos = computeNewPosition(reordered, toIndex, toIndex);
      const updatedMoved = { ...moved, position: newPos };
      const updated = reordered.map((item, i) => item.id === moved.id ? updatedMoved : item);

      // Normalize if needed
      const normalized = normalizePositions(updated);
      onItemsChange(date, normalized);

      // Persist
      try {
        await itemsApi.reorder(
          tripId,
          normalized.map(i => ({ id: i.id, position: i.position })),
        );
      } catch {
        showToast('Failed to save order. Please refresh.');
      }
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
        {toastMsg && (
          <div style={{ position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)', background: '#2C1A0E', color: 'white', padding: '12px 20px', borderRadius: '10px', fontSize: '14px', zIndex: 100 }}>
            {toastMsg}
          </div>
        )}

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

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={sortedItems.map(i => i.id)} strategy={verticalListSortingStrategy}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {displayedItems.length === 0 && (
                <div style={{ padding: '24px', textAlign: 'center', background: 'rgba(255,255,255,0.3)', borderRadius: '12px', border: '2px dashed rgba(124,106,90,0.15)' }}>
                  <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                    {activeTags.length > 0 ? 'No items match the selected tags.' : 'No items yet — click "Add Item" to start planning.'}
                  </p>
                </div>
              )}
              {displayedItems.map(item => (
                <SortableItem
                  key={item.id}
                  item={item}
                  onEdit={() => { setEditItem(item); setModalError(null); }}
                  onDelete={() => handleDeleteItem(item.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

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
