import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

const buttonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95",
    {
        variants: {
            variant: {
                default: "bg-netsim-cyan text-black hover:bg-netsim-cyan-light shadow-[0_0_15px_rgba(41,217,255,0.3)]",
                destructive:
                    "bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white shadow-[0_0_15px_rgba(239,68,68,0.2)]",
                outline:
                    "border border-white/10 bg-white/5 hover:bg-white/10 hover:text-white hover:border-white/20",
                secondary:
                    "bg-white/10 text-white hover:bg-white/20 border border-white/5",
                ghost: "hover:bg-white/10 hover:text-white",
                link: "text-netsim-cyan underline-offset-4 hover:underline",
                // NetSim Premium Variants
                premium: "premium-button text-white shadow-lg border border-white/20",
                glass: "glass-button text-white",
                neon: "bg-transparent border border-netsim-cyan/50 text-netsim-cyan shadow-[0_0_15px_rgba(41,217,255,0.15)] hover:bg-netsim-cyan/10 hover:shadow-[0_0_25px_rgba(41,217,255,0.3)] hover:border-netsim-cyan animate-neon-pulse",
                shimmer: "premium-button text-white overflow-hidden relative after:absolute after:inset-0 after:-translate-x-full after:animate-shimmer after:bg-gradient-to-r after:from-transparent after:via-white/20 after:to-transparent"
            },
            size: {
                default: "h-10 px-5 py-2",
                sm: "h-9 rounded-md px-3",
                lg: "h-12 rounded-xl px-10 text-base font-semibold",
                icon: "h-10 w-10",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean
    loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, loading = false, children, ...props }, ref) => {
        const Comp = asChild ? Slot : "button"
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                disabled={props.disabled || loading}
                {...props}
            >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {children}
            </Comp>
        )
    }
)
Button.displayName = "Button"

export { Button, buttonVariants }
