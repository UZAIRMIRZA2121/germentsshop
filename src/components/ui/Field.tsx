import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { cn } from "@/lib/utils";

interface FieldShellProps {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  optional?: boolean;
  className?: string;
  id: string;
  children: ReactNode;
}

function FieldShell({ label, error, hint, required, optional, className, id, children }: FieldShellProps) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 flex items-center gap-1 text-sm font-medium text-ink-800">
        {label}
        {required && (
          <span className="text-red-500" aria-hidden>
            *
          </span>
        )}
        {optional && <span className="text-xs font-normal text-ink-400">(optional)</span>}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-ink-500">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-xs font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

function describedBy(id: string, error?: string, hint?: string) {
  if (error) return `${id}-error`;
  if (hint) return `${id}-hint`;
  return undefined;
}

interface CommonProps {
  label: string;
  error?: string;
  hint?: string;
  optional?: boolean;
  wrapperClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & CommonProps>(
  function Input({ label, error, hint, optional, wrapperClassName, className, required, id, ...props }, ref) {
    const autoId = useId();
    const fieldId = id ?? autoId;
    return (
      <FieldShell id={fieldId} label={label} error={error} hint={hint} required={required} optional={optional} className={wrapperClassName}>
        <input
          ref={ref}
          id={fieldId}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(fieldId, error, hint)}
          className={cn("input-base", error && "input-error", className)}
          {...props}
        />
      </FieldShell>
    );
  },
);

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement> & CommonProps>(
  function Textarea({ label, error, hint, optional, wrapperClassName, className, required, id, ...props }, ref) {
    const autoId = useId();
    const fieldId = id ?? autoId;
    return (
      <FieldShell id={fieldId} label={label} error={error} hint={hint} required={required} optional={optional} className={wrapperClassName}>
        <textarea
          ref={ref}
          id={fieldId}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(fieldId, error, hint)}
          className={cn("input-base min-h-[96px] resize-y", error && "input-error", className)}
          {...props}
        />
      </FieldShell>
    );
  },
);

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement> & CommonProps>(
  function Select({ label, error, hint, optional, wrapperClassName, className, required, id, children, ...props }, ref) {
    const autoId = useId();
    const fieldId = id ?? autoId;
    return (
      <FieldShell id={fieldId} label={label} error={error} hint={hint} required={required} optional={optional} className={wrapperClassName}>
        <select
          ref={ref}
          id={fieldId}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(fieldId, error, hint)}
          className={cn("input-base appearance-none bg-[length:1.1rem] bg-[right_0.75rem_center] bg-no-repeat pr-9", error && "input-error", className)}
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236f6b64' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
          }}
          {...props}
        >
          {children}
        </select>
      </FieldShell>
    );
  },
);

