import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500',
  {
    variants: {
      variant: {
        primary:
          'bg-sky-500 text-white hover:bg-sky-600 hover:-translate-y-0.5 shadow-sm hover:shadow-md hover:shadow-sky-500/25 active:translate-y-0',
        cta: 'bg-orange-500 text-white hover:bg-orange-600 hover:-translate-y-0.5 shadow-sm hover:shadow-md hover:shadow-orange-500/25 active:translate-y-0',
        secondary:
          'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-sm',
        ghost: 'text-slate-500 hover:bg-slate-100 hover:text-slate-700',
        danger: 'bg-red-500 text-white hover:bg-red-600 shadow-sm',
        link: 'text-sky-500 underline-offset-4 hover:underline p-0 h-auto',
      },
      size: {
        sm: 'h-8 px-3 text-xs rounded-lg',
        md: 'h-10 px-4',
        lg: 'h-12 px-6 text-base',
        icon: 'h-9 w-9 rounded-lg',
        'icon-sm': 'h-7 w-7 rounded-md',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
