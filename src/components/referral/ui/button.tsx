import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-archivo uppercase tracking-[0.08em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gaude-orange disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-gaude-orange text-white hover:bg-gaude-orange/90",
        secondary:
          "bg-[var(--dash-hover,rgba(255,255,255,0.05))] text-[var(--dash-text,#fff)] hover:bg-[var(--dash-surface-strong,rgba(255,255,255,0.1))] border border-[var(--dash-border,rgba(255,255,255,0.1))]",
        outline:
          "border border-[var(--dash-border,rgba(255,255,255,0.15))] bg-transparent hover:bg-[var(--dash-hover,rgba(255,255,255,0.05))] text-[var(--dash-text,#fff)]",
        ghost:
          "hover:bg-[var(--dash-hover,rgba(255,255,255,0.05))] text-[var(--dash-text,#fff)] tracking-normal normal-case font-sans",
        destructive: "bg-red-600 text-white hover:bg-red-500",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 rounded-full px-4 text-xs",
        lg: "h-12 rounded-full px-8 text-sm",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  )
);
Button.displayName = "Button";
