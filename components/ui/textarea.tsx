import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-16 w-full rounded-sm border border-input bg-surface px-3 py-2 text-[0.9375rem] text-ink placeholder:text-ink-4 transition-colors duration-[120ms] outline-none focus-visible:border-brand focus-visible:outline-2 focus-visible:outline-offset-[-1px] focus-visible:outline-brand disabled:cursor-not-allowed disabled:bg-paper-2 disabled:text-ink-4 aria-invalid:border-err aria-invalid:focus-visible:outline-err",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
