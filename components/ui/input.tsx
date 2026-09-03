import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 rounded-sm border border-input bg-surface px-3 text-[0.9375rem] text-ink placeholder:text-ink-4 transition-colors duration-[120ms] outline-none focus-visible:border-brand focus-visible:outline-2 focus-visible:outline-offset-[-1px] focus-visible:outline-brand disabled:cursor-not-allowed disabled:bg-paper-2 disabled:text-ink-4 aria-invalid:border-err aria-invalid:focus-visible:outline-err md:h-9",
        className
      )}
      {...props}
    />
  )
}

export { Input }
