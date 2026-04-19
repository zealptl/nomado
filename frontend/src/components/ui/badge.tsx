import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors cursor-default',
  {
    variants: {
      variant: {
        default: 'bg-sky-100 text-sky-700 border border-sky-200',
        active: 'bg-sky-500 text-white',
        secondary: 'bg-slate-100 text-slate-600 border border-slate-200',
        orange: 'bg-orange-100 text-orange-700 border border-orange-200',
        cyan: 'bg-cyan-100 text-cyan-700 border border-cyan-200',
        green: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
        red: 'bg-red-100 text-red-600 border border-red-200',
        outline: 'border border-slate-200 text-slate-600 bg-white hover:bg-slate-50',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
