import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-none rounded-sm bg-n-100", className)}
      {...props}
    />
  )
}

export { Skeleton }
