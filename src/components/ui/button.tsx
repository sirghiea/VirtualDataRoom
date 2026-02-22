import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'bg-gradient-to-b from-primary to-primary/90 text-primary-foreground shadow-lg shadow-primary/30 hover:shadow-primary/40 hover:from-primary-hover hover:to-primary active:scale-[0.97] ring-1 ring-primary/20',
        destructive:
          'bg-gradient-to-b from-destructive to-destructive/90 text-destructive-foreground shadow-lg shadow-destructive/30 hover:shadow-destructive/40 hover:from-destructive-hover hover:to-destructive active:scale-[0.97] ring-1 ring-destructive/20',
        outline:
          'border border-white/[0.08] bg-white/[0.02] text-foreground hover:bg-white/[0.06] hover:border-white/[0.12] active:scale-[0.97]',
        ghost:
          'text-foreground hover:bg-white/[0.06] active:scale-[0.97]',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-lg px-3 text-xs',
        lg: 'h-10 rounded-xl px-6',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants }; // eslint-disable-line react-refresh/only-export-components
