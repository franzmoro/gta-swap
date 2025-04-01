import { cn } from '@/lib/utils';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

const buttonVariants = cva(
  "cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    defaultVariants: {
      size: 'default',
      variant: 'default',
    },
    variants: {
      size: {
        default: 'h-9 px-4 py-2 has-[>svg]:px-3',
        icon: 'size-9',
        lg: 'h-13 rounded-md px-6 has-[>svg]:px-4',
        sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
      },
      variant: {
        default: 'bg-primary text-primary-foreground shadow-xs hover:bg-secondary',
        destructive:
          'bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
        ghost: 'text-secondary hover:bg-secondary hover:text-primary-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        outline:
          'border border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground',
        secondary: 'bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80',
        unstyled: 'text-secondary',
      },
    },
  }
);

const Button = ({
  asChild = false,
  className,
  size,
  variant,
  ...props
}: {
  asChild?: boolean;
} & React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants>) => {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      className={cn(buttonVariants({ className, size, variant }))}
      data-slot="button"
      {...props}
    />
  );
};

export { Button, buttonVariants };
