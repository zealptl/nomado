import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-xl border bg-white px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition-all duration-200',
          'border-slate-200 hover:border-slate-300',
          'focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500',
          error && 'border-red-400 focus:ring-red-500/20 focus:border-red-500',
          'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-50',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: boolean }>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-all duration-200 resize-none',
          'border-slate-200 hover:border-slate-300',
          'focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500',
          error && 'border-red-400 focus:ring-red-500/20 focus:border-red-500',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = 'Textarea'

const Label = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn('block text-sm font-medium text-slate-700 mb-1.5', className)}
      {...props}
    />
  )
)
Label.displayName = 'Label'

export { Input, Textarea, Label }
