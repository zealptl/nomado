import { Plus, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { TripSegment } from '../types'

interface DayEntry {
  date: string
  badge?: 'checkout' | 'checkin'
}

interface SegmentGroup {
  segment: TripSegment
  days: DayEntry[]
}

interface SegmentNavProps {
  segments: TripSegment[]
  allDays: string[]
  activeDay: string | null
  onDayClick: (date: string) => void
  onAddSegment: () => void
  onEditSegment: (seg: TripSegment) => void
  onDeleteSegment: (seg: TripSegment) => void
}

function formatNavDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

function buildSegmentGroups(segments: TripSegment[], allDays: string[]): { groups: SegmentGroup[]; unassignedDays: string[] } {
  if (segments.length === 0) return { groups: [], unassignedDays: allDays }

  const sorted = [...segments].sort((a, b) => a.start_date.localeCompare(b.start_date))
  const groups: SegmentGroup[] = []

  for (let si = 0; si < sorted.length; si++) {
    const seg = sorted[si]
    const prevSeg = sorted[si - 1]
    const nextSeg = sorted[si + 1]
    const days: DayEntry[] = []

    for (const day of allDays) {
      if (day >= seg.start_date && day <= seg.end_date) {
        let badge: 'checkout' | 'checkin' | undefined
        if (nextSeg && day === seg.end_date && day === nextSeg.start_date) badge = 'checkout'
        else if (prevSeg && day === seg.start_date && day === prevSeg.end_date) badge = 'checkin'
        days.push({ date: day, badge })
      }
    }

    groups.push({ segment: seg, days })
  }

  const assignedDays = new Set(groups.flatMap(g => g.days.map(d => d.date)))
  const unassignedDays = allDays.filter(d => !assignedDays.has(d))
  return { groups, unassignedDays }
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
  const { groups, unassignedDays } = buildSegmentGroups(segments, allDays)

  function DayLink({ date, badge }: DayEntry) {
    const isActive = activeDay === date

    return (
      <div
        className={`flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer transition-all duration-150 group/day ${
          isActive
            ? 'bg-sky-50 border border-sky-100'
            : 'hover:bg-slate-50'
        }`}
        style={{ borderLeft: isActive ? '3px solid #0ea5e9' : '3px solid transparent' }}
        onClick={() => onDayClick(date)}
        role="button"
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && onDayClick(date)}
      >
        <span className={`text-sm transition-colors ${isActive ? 'text-sky-600 font-semibold' : 'text-slate-500 group-hover/day:text-slate-700'}`}>
          {formatNavDate(date)}
        </span>
        {badge === 'checkout' && (
          <Badge variant="orange" className="text-[10px] px-1.5 py-0">checkout</Badge>
        )}
        {badge === 'checkin' && (
          <Badge variant="cyan" className="text-[10px] px-1.5 py-0">checkin</Badge>
        )}
      </div>
    )
  }

  return (
    <div className="p-3 flex flex-col gap-5">
      {groups.map(({ segment, days }) => (
        <div key={segment.id} className="group">
          <div className="flex items-center justify-between mb-1.5 px-1">
            <h4 className="text-sm font-bold text-slate-700" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              {segment.title}
            </h4>
            <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => onEditSegment(segment)}
                aria-label={`Edit segment ${segment.title}`}
              >
                <Pencil size={12} />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => onDeleteSegment(segment)}
                className="text-slate-400 hover:text-red-500 hover:bg-red-50"
                aria-label={`Delete segment ${segment.title}`}
              >
                <Trash2 size={12} />
              </Button>
            </div>
          </div>
          <div className="flex flex-col gap-0.5">
            {days.map(entry => <DayLink key={entry.date + (entry.badge ?? '')} {...entry} />)}
          </div>
        </div>
      ))}

      {unassignedDays.length > 0 && (
        <div>
          {groups.length > 0 && (
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 px-1">Unassigned</p>
          )}
          <div className="flex flex-col gap-0.5">
            {unassignedDays.map(date => <DayLink key={date} date={date} />)}
          </div>
        </div>
      )}

      <div className="pt-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={onAddSegment}
          className="w-full justify-start text-slate-400 hover:text-sky-500 hover:bg-sky-50 gap-2"
        >
          <Plus size={14} />
          Add Segment
        </Button>
      </div>
    </div>
  )
}
