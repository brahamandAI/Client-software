import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-gradient-to-r from-railway-orange to-railway-red text-white hover:from-railway-darkOrange hover:to-railway-red shadow-lg hover:shadow-xl transition-all duration-200',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border-2 border-railway-orange bg-transparent text-railway-orange hover:bg-railway-orange hover:text-white transition-all duration-200',
        secondary: 'bg-railway-cream text-railway-darkOrange hover:bg-railway-lightOrange transition-all duration-200',
        ghost: 'hover:bg-railway-lightOrange hover:text-railway-darkOrange transition-all duration-200',
        link: 'text-railway-orange underline-offset-4 hover:underline hover:text-railway-red transition-colors duration-200',
        railway: 'bg-gradient-to-r from-railway-orange to-railway-red text-white hover:from-railway-darkOrange hover:to-railway-red shadow-lg hover:shadow-xl transition-all duration-200 border-2 border-railway-orange/30',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
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
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
