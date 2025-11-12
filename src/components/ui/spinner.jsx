import * as React from "react"
import { cn } from "@/lib/utils"

const Spinner = React.forwardRef(({ className, size = "default", ...props }, ref) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    default: "h-8 w-8",
    lg: "h-12 w-12",
  }

  return (
    <div
      ref={ref}
      className={cn("animate-spin rounded-full border-2 border-current border-t-transparent", sizeClasses[size], className)}
      {...props}
    >
      <span className="sr-only">Loading...</span>
    </div>
  )
})
Spinner.displayName = "Spinner"

export { Spinner }

