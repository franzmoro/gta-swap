import { cn } from '@/lib/utils';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import * as React from 'react';

const TooltipProvider = ({
  delayDuration = 0,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) => {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      {...props}
    />
  );
};

const Tooltip = ({
  children,
  useTouch = false,
  ...props
}: {
  useTouch?: boolean;
} & React.ComponentProps<typeof TooltipPrimitive.Root>) => {
  const [open, setOpen] = React.useState(false);

  const handleTouch = (event: React.MouseEvent | React.TouchEvent) => {
    event.persist();
    setOpen(true);
  };

  return (
    <TooltipProvider>
      <TooltipPrimitive.Root data-slot="tooltip" onOpenChange={setOpen} open={open} {...props}>
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child) && useTouch) {
            return React.cloneElement(
              child as React.ReactElement<React.HTMLAttributes<HTMLElement>>,
              {
                onMouseDown: handleTouch,
                onTouchStart: handleTouch,
              }
            );
          }
          return child;
        })}
      </TooltipPrimitive.Root>
    </TooltipProvider>
  );
};

const TooltipTrigger = ({ ...props }: React.ComponentProps<typeof TooltipPrimitive.Trigger>) => {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
};

const TooltipContent = ({
  sideOffset = 0,
  children,
  className,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) => {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        className={cn(
          'z-50 w-fit origin-(--radix-tooltip-content-transform-origin) animate-in rounded-md bg-card px-3 py-1.5 text-xs text-balance text-card-foreground fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
          className
        )}
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        {...props}
      >
        {children}
        {/* <TooltipPrimitive.Arrow className="z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px] bg-primary fill-primary" /> */}
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
};

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger };
