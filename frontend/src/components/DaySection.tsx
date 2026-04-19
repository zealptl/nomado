import { forwardRef, useState } from 'react'
import { Plus } from 'lucide-react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import ItemCard from './ItemCard'
import ItemFormModal from './ItemFormModal'
import { itemsApi } from '../lib/api'
import { Button } from '@/components/ui/button'
import type { ItineraryItem } from '../types'

interface Tag {
  id: string | null
  name: string
  isDefault: boolean
}

interface DaySectionProps {
  date: string
  tripId: string
  items: (ItineraryItem & { item_photos?: { id: string; storage_url: string }[] })[]
  availableTags: Tag[]
  onItemsChange: (date: string, items: ItineraryItem[]) => void
}

function formatDayHeader(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  const weekday = d.toLocaleDateString('en-US', { weekday: 'long' })
  const date = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  return { weekday, date }
}

function computeNewPosition(items: ItineraryItem[], _fromIndex: number, toIndex: number): number {
  const sorted = [...items].sort((a, b) => a.position - b.position)
  const before = sorted[toIndex - 1]?.position
  const after = sorted[toIndex]?.position

  if (before === undefined && after === undefined) return 1.0
  if (before === undefined) return after! - 1.0
  if (after === undefined) return before + 1.0
  return (before + after) / 2
}

function normalizePositions(items: ItineraryItem[]): ItineraryItem[] {
  const sorted = [...items].sort((a, b) => a.position - b.position)
  const minGap = sorted.reduce((min, item, i) => {
    if (i === 0) return min
    return Math.min(min, item.position - sorted[i - 1].position)
  }, Infinity)

  if (minGap >= 0.001) return items
  return sorted.map((item, i) => ({ ...item, position: i + 1 }))
}

function SortableItem({
  item,
  onEdit,
  onDelete,
}: {
  item: ItineraryItem & { item_photos?: { id: string; storage_url: string }[] }
  onEdit: () => void
  onDelete: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id })

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
  )
}

const TAG_COLORS: Record<string, string> = {
  food: 'bg-orange-100 text-orange-700 border-orange-200 data-[active]:bg-orange-500 data-[active]:text-white',
  drinks: 'bg-cyan-100 text-cyan-700 border-cyan-200 data-[active]:bg-cyan-500 data-[active]:text-white',
  stay: 'bg-sky-100 text-sky-700 border-sky-200 data-[active]:bg-sky-500 data-[active]:text-white',
  activity: 'bg-emerald-100 text-emerald-700 border-emerald-200 data-[active]:bg-emerald-500 data-[active]:text-white',
  'going out': 'bg-purple-100 text-purple-700 border-purple-200 data-[active]:bg-purple-500 data-[active]:text-white',
}

function getTagClasses(tag: string, isActive: boolean): string {
  const base = TAG_COLORS[tag] ?? 'bg-slate-100 text-slate-600 border-slate-200 data-[active]:bg-slate-500 data-[active]:text-white'
  const [normal, active] = base.split(' data-[active]:')
  if (isActive) return `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border cursor-pointer transition-all ${active.replace('data-[active]:', '').replace(/ /g, ' ')} bg-opacity-100`
  return `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border cursor-pointer transition-all ${normal} hover:opacity-80`
}

const DaySection = forwardRef<HTMLDivElement, DaySectionProps>(
  function DaySection({ date, tripId, items, availableTags, onItemsChange }, ref) {
    const [activeTags, setActiveTags] = useState<string[]>([])
    const [addOpen, setAddOpen] = useState(false)
    const [editItem, setEditItem] = useState<ItineraryItem | null>(null)
    const [submitting, setSubmitting] = useState(false)
    const [modalError, setModalError] = useState<string | null>(null)
    const [toastMsg, setToastMsg] = useState<string | null>(null)

    const sensors = useSensors(
      useSensor(PointerSensor),
      useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    )

    const sortedItems = [...items].sort((a, b) => a.position - b.position)
    const tagsInDay = [...new Set(sortedItems.flatMap(i => i.tags))]
    const displayedItems = activeTags.length > 0
      ? sortedItems.filter(i => i.tags.some(t => activeTags.includes(t)))
      : sortedItems

    function toggleTag(tag: string) {
      setActiveTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])
    }

    function showToast(msg: string) {
      setToastMsg(msg)
      setTimeout(() => setToastMsg(null), 3000)
    }

    async function handleDragEnd(event: DragEndEvent) {
      const { active, over } = event
      if (!over || active.id === over.id) return

      const fromIndex = sortedItems.findIndex(i => i.id === active.id)
      const toIndex = sortedItems.findIndex(i => i.id === over.id)
      if (fromIndex === -1 || toIndex === -1) return

      const reordered = [...sortedItems]
      const [moved] = reordered.splice(fromIndex, 1)
      reordered.splice(toIndex, 0, moved)

      const newPos = computeNewPosition(reordered, toIndex, toIndex)
      const updatedMoved = { ...moved, position: newPos }
      const updated = reordered.map(item => item.id === moved.id ? updatedMoved : item)
      const normalized = normalizePositions(updated)
      onItemsChange(date, normalized)

      try {
        await itemsApi.reorder(tripId, normalized.map(i => ({ id: i.id, position: i.position })))
      } catch {
        showToast('Failed to save order. Please refresh.')
      }
    }

    async function handleAddItem(data: Partial<ItineraryItem> & { photos?: string[] }) {
      setSubmitting(true)
      setModalError(null)
      try {
        const newItem = await itemsApi.create(tripId, { ...data, date } as any)
        onItemsChange(date, [...items, newItem])
        setAddOpen(false)
      } catch (e: any) {
        setModalError(e.message)
      } finally {
        setSubmitting(false)
      }
    }

    async function handleEditItem(data: Partial<ItineraryItem> & { photos?: string[] }) {
      if (!editItem) return
      setSubmitting(true)
      setModalError(null)
      try {
        const updated = await itemsApi.update(tripId, editItem.id, { ...data, updated_at: editItem.updated_at } as any)
        onItemsChange(date, items.map(i => i.id === updated.id ? updated : i))
        setEditItem(null)
      } catch (e: any) {
        if ((e as any).status === 409) {
          showToast('This item was updated by someone else. Please refresh.')
          setEditItem(null)
        } else {
          setModalError(e.message)
        }
      } finally {
        setSubmitting(false)
      }
    }

    async function handleDeleteItem(itemId: string) {
      await itemsApi.delete(tripId, itemId)
      onItemsChange(date, items.filter(i => i.id !== itemId))
    }

    const { weekday, date: dateLabel } = formatDayHeader(date)

    return (
      <div ref={ref} data-day={date} className="mb-10">
        {toastMsg && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-4 py-2.5 rounded-xl text-sm z-50 shadow-xl">
            {toastMsg}
          </div>
        )}

        {/* Day header */}
        <div className="flex items-start justify-between mb-4 gap-3">
          <div className="flex items-start gap-3">
            {/* Day number dot */}
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)' }}
            >
              <span className="text-white text-xs font-bold">{new Date(date + 'T00:00:00').getDate()}</span>
            </div>
            <div>
              <h3
                className="text-xl font-bold text-slate-900 leading-tight"
                style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
              >
                {weekday}
              </h3>
              <p className="text-sm text-slate-400 mt-0.5">{dateLabel}</p>
              {tagsInDay.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {tagsInDay.map(tag => (
                    <button
                      key={tag}
                      type="button"
                      className={getTagClasses(tag, activeTags.includes(tag))}
                      onClick={() => toggleTag(tag)}
                      aria-pressed={activeTags.includes(tag)}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <Button
            variant="cta"
            size="sm"
            onClick={() => setAddOpen(true)}
            className="flex-shrink-0 mt-1"
          >
            <Plus size={14} />
            Add
          </Button>
        </div>

        {/* Items */}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={sortedItems.map(i => i.id)} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col gap-2.5 ml-13" style={{ marginLeft: '52px' }}>
              {displayedItems.length === 0 && (
                <div className="py-6 text-center bg-white rounded-xl border-2 border-dashed border-slate-150">
                  <p className="text-sm text-slate-400">
                    {activeTags.length > 0 ? 'No items match the selected tags.' : 'Nothing planned yet — click Add to start.'}
                  </p>
                </div>
              )}
              {displayedItems.map(item => (
                <SortableItem
                  key={item.id}
                  item={item}
                  onEdit={() => { setEditItem(item); setModalError(null) }}
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
    )
  }
)

export default DaySection
