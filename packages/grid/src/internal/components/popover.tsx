'use client';

import * as React from 'react';

import { Popover as PopoverPrimitive } from '@base-ui/react/popover';
import { cn } from 'cn';

function Popover({ ...props }: PopoverPrimitive.Root.Props) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />;
}

function PopoverTrigger({ ...props }: PopoverPrimitive.Trigger.Props) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />;
}

function PopoverContent({
  className,
  align = 'center',
  alignOffset = 0,
  side = 'bottom',
  sideOffset = 4,
  anchor,
  ...props
}: PopoverPrimitive.Popup.Props &
  Pick<PopoverPrimitive.Positioner.Props, 'align' | 'alignOffset' | 'side' | 'sideOffset' | 'anchor'>) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Positioner
        anchor={anchor}
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
        className="ig:isolate ig:z-50"
      >
        <PopoverPrimitive.Popup
          data-slot="popover-content"
          className={cn(
            'ig:z-50 ig:flex ig:w-72 ig:origin-(--transform-origin) ig:flex-col ig:gap-4 ig:rounded-lg ig:bg-popover ig:p-2.5 ig:text-xs ig:text-popover-foreground ig:shadow-md ig:ring-1 ig:ring-foreground/10 ig:outline-hidden ig:duration-100 ig:data-[side=bottom]:slide-in-from-top-2 ig:data-[side=inline-end]:slide-in-from-left-2 ig:data-[side=inline-start]:slide-in-from-right-2 ig:data-[side=left]:slide-in-from-right-2 ig:data-[side=right]:slide-in-from-left-2 ig:data-[side=top]:slide-in-from-bottom-2 ig:data-open:animate-in ig:data-open:fade-in-0 ig:data-open:zoom-in-95 ig:data-closed:animate-out ig:data-closed:fade-out-0 ig:data-closed:zoom-out-95',
            className
          )}
          {...props}
        />
      </PopoverPrimitive.Positioner>
    </PopoverPrimitive.Portal>
  );
}

function PopoverHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div data-slot="popover-header" className={cn('ig:flex ig:flex-col ig:gap-1 ig:text-xs', className)} {...props} />
  );
}

function PopoverTitle({ className, ...props }: PopoverPrimitive.Title.Props) {
  return (
    <PopoverPrimitive.Title
      data-slot="popover-title"
      className={cn('ig:text-sm ig:font-medium', className)}
      {...props}
    />
  );
}

function PopoverDescription({ className, ...props }: PopoverPrimitive.Description.Props) {
  return (
    <PopoverPrimitive.Description
      data-slot="popover-description"
      className={cn('ig:text-muted-foreground', className)}
      {...props}
    />
  );
}

export { Popover, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger };
