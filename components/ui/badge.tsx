import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        outline: "text-foreground",
        high: "border-transparent bg-destructive/15 text-destructive",
        medium: "border-transparent bg-amber-500/15 text-amber-800 dark:text-amber-300",
        low: "border-transparent bg-muted text-muted-foreground",
        success: "border-transparent bg-emerald-500/15 text-emerald-800 dark:text-emerald-300",
        warning: "border-transparent bg-amber-500/15 text-amber-800 dark:text-amber-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
