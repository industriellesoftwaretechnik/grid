import * as React from 'react';

import { ContextMenu as ContextMenuPrimitive } from '@base-ui/react/context-menu';
import { cn } from 'cn';
import { ChevronRightIcon, CheckIcon } from 'lucide-react';

function ContextMenu({ ...props }: ContextMenuPrimitive.Root.Props) {
  return <ContextMenuPrimitive.Root data-slot="context-menu" {...props} />;
}

function ContextMenuPortal({ ...props }: ContextMenuPrimitive.Portal.Props) {
  return <ContextMenuPrimitive.Portal data-slot="context-menu-portal" {...props} />;
}

function ContextMenuTrigger({ className, ...props }: ContextMenuPrimitive.Trigger.Props) {
  return (
    <ContextMenuPrimitive.Trigger
      data-slot="context-menu-trigger"
      className={cn('ig:select-none', className)}
      {...props}
    />
  );
}

function ContextMenuContent({
  className,
  align = 'start',
  alignOffset = 4,
  side = 'right',
  sideOffset = 0,
  ...props
}: ContextMenuPrimitive.Popup.Props &
  Pick<ContextMenuPrimitive.Positioner.Props, 'align' | 'alignOffset' | 'side' | 'sideOffset'>) {
  return (
    <ContextMenuPrimitive.Portal>
      <ContextMenuPrimitive.Positioner
        className="ig:isolate ig:z-50 ig:outline-none"
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
      >
        <ContextMenuPrimitive.Popup
          data-slot="context-menu-content"
          className={cn(
            'ig:z-50 ig:max-h-(--available-height) ig:min-w-32 ig:origin-(--transform-origin) ig:overflow-x-hidden ig:overflow-y-auto ig:rounded-lg ig:bg-popover ig:p-1 ig:text-popover-foreground ig:shadow-md ig:ring-1 ig:ring-foreground/10 ig:duration-100 ig:outline-none ig:data-[side=bottom]:slide-in-from-top-2 ig:data-[side=inline-end]:slide-in-from-left-2 ig:data-[side=inline-start]:slide-in-from-right-2 ig:data-[side=left]:slide-in-from-right-2 ig:data-[side=right]:slide-in-from-left-2 ig:data-[side=top]:slide-in-from-bottom-2 ig:data-open:animate-in ig:data-open:fade-in-0 ig:data-open:zoom-in-95 ig:data-closed:animate-out ig:data-closed:fade-out-0 ig:data-closed:zoom-out-95',
            className
          )}
          {...props}
        />
      </ContextMenuPrimitive.Positioner>
    </ContextMenuPrimitive.Portal>
  );
}

function ContextMenuGroup({ ...props }: ContextMenuPrimitive.Group.Props) {
  return <ContextMenuPrimitive.Group data-slot="context-menu-group" {...props} />;
}

function ContextMenuLabel({
  className,
  inset,
  ...props
}: ContextMenuPrimitive.GroupLabel.Props & {
  inset?: boolean;
}) {
  return (
    <ContextMenuPrimitive.GroupLabel
      data-slot="context-menu-label"
      data-inset={inset}
      className={cn('ig:px-2 ig:py-1.5 ig:text-xs ig:text-muted-foreground ig:data-inset:pl-7.5', className)}
      {...props}
    />
  );
}

function ContextMenuItem({
  className,
  inset,
  variant = 'default',
  ...props
}: ContextMenuPrimitive.Item.Props & {
  inset?: boolean;
  variant?: 'default' | 'destructive';
}) {
  return (
    <ContextMenuPrimitive.Item
      data-slot="context-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        "ig:group/context-menu-item ig:relative ig:flex ig:min-h-7 ig:cursor-default ig:items-center ig:gap-2 ig:rounded-md ig:px-2 ig:py-1 ig:text-xs/relaxed ig:outline-hidden ig:select-none ig:focus:bg-accent ig:focus:text-accent-foreground ig:not-data-[variant=destructive]:focus:**:text-accent-foreground ig:data-inset:pl-7.5 ig:data-[variant=destructive]:text-destructive ig:data-[variant=destructive]:focus:bg-destructive/10 ig:data-[variant=destructive]:focus:text-destructive ig:dark:data-[variant=destructive]:focus:bg-destructive/20 ig:data-disabled:pointer-events-none ig:data-disabled:opacity-50 ig:[&_svg]:pointer-events-none ig:[&_svg]:shrink-0 ig:[&_svg:not([class*='size-'])]:size-3.5 ig:data-[variant=destructive]:*:[svg]:text-destructive",
        className
      )}
      {...props}
    />
  );
}

function ContextMenuSub({ ...props }: ContextMenuPrimitive.SubmenuRoot.Props) {
  return <ContextMenuPrimitive.SubmenuRoot data-slot="context-menu-sub" {...props} />;
}

function ContextMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: ContextMenuPrimitive.SubmenuTrigger.Props & {
  inset?: boolean;
}) {
  return (
    <ContextMenuPrimitive.SubmenuTrigger
      data-slot="context-menu-sub-trigger"
      data-inset={inset}
      className={cn(
        "ig:flex ig:min-h-7 ig:cursor-default ig:items-center ig:gap-2 ig:rounded-md ig:px-2 ig:py-1 ig:text-xs ig:outline-hidden ig:select-none ig:focus:bg-accent ig:focus:text-accent-foreground ig:not-data-[variant=destructive]:focus:**:text-accent-foreground ig:data-inset:pl-7.5 ig:data-open:bg-accent ig:data-open:text-accent-foreground ig:[&_svg]:pointer-events-none ig:[&_svg]:shrink-0 ig:[&_svg:not([class*='size-'])]:size-3.5",
        className
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ig:ml-auto" />
    </ContextMenuPrimitive.SubmenuTrigger>
  );
}

function ContextMenuSubContent({ ...props }: React.ComponentProps<typeof ContextMenuContent>) {
  return <ContextMenuContent data-slot="context-menu-sub-content" className="ig:shadow-lg" side="right" {...props} />;
}

function ContextMenuCheckboxItem({
  className,
  children,
  checked,
  inset,
  ...props
}: ContextMenuPrimitive.CheckboxItem.Props & {
  inset?: boolean;
}) {
  return (
    <ContextMenuPrimitive.CheckboxItem
      data-slot="context-menu-checkbox-item"
      data-inset={inset}
      className={cn(
        "ig:relative ig:flex ig:min-h-7 ig:cursor-default ig:items-center ig:gap-2 ig:rounded-md ig:py-1.5 ig:pr-8 ig:pl-2 ig:text-xs ig:outline-hidden ig:select-none ig:focus:bg-accent ig:focus:text-accent-foreground ig:focus:**:text-accent-foreground ig:data-inset:pl-7.5 ig:data-disabled:pointer-events-none ig:data-disabled:opacity-50 ig:[&_svg]:pointer-events-none ig:[&_svg]:shrink-0 ig:[&_svg:not([class*='size-'])]:size-3.5",
        className
      )}
      checked={checked}
      {...props}
    >
      <span className="ig:pointer-events-none ig:absolute ig:right-2 ig:flex ig:items-center ig:justify-center">
        <ContextMenuPrimitive.CheckboxItemIndicator>
          <CheckIcon />
        </ContextMenuPrimitive.CheckboxItemIndicator>
      </span>
      {children}
    </ContextMenuPrimitive.CheckboxItem>
  );
}

function ContextMenuRadioGroup({ ...props }: ContextMenuPrimitive.RadioGroup.Props) {
  return <ContextMenuPrimitive.RadioGroup data-slot="context-menu-radio-group" {...props} />;
}

function ContextMenuRadioItem({
  className,
  children,
  inset,
  ...props
}: ContextMenuPrimitive.RadioItem.Props & {
  inset?: boolean;
}) {
  return (
    <ContextMenuPrimitive.RadioItem
      data-slot="context-menu-radio-item"
      data-inset={inset}
      className={cn(
        "ig:relative ig:flex ig:min-h-7 ig:cursor-default ig:items-center ig:gap-2 ig:rounded-md ig:py-1.5 ig:pr-8 ig:pl-2 ig:text-xs ig:outline-hidden ig:select-none ig:focus:bg-accent ig:focus:text-accent-foreground ig:focus:**:text-accent-foreground ig:data-inset:pl-7.5 ig:data-disabled:pointer-events-none ig:data-disabled:opacity-50 ig:[&_svg]:pointer-events-none ig:[&_svg]:shrink-0 ig:[&_svg:not([class*='size-'])]:size-3.5",
        className
      )}
      {...props}
    >
      <span className="ig:pointer-events-none ig:absolute ig:right-2 ig:flex ig:items-center ig:justify-center">
        <ContextMenuPrimitive.RadioItemIndicator>
          <CheckIcon />
        </ContextMenuPrimitive.RadioItemIndicator>
      </span>
      {children}
    </ContextMenuPrimitive.RadioItem>
  );
}

function ContextMenuSeparator({ className, ...props }: ContextMenuPrimitive.Separator.Props) {
  return (
    <ContextMenuPrimitive.Separator
      data-slot="context-menu-separator"
      className={cn('ig:-mx-1 ig:my-1 ig:h-px ig:bg-border/50', className)}
      {...props}
    />
  );
}

function ContextMenuShortcut({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="context-menu-shortcut"
      className={cn(
        'ig:ml-auto ig:text-[0.625rem] ig:tracking-widest ig:text-muted-foreground ig:group-focus/context-menu-item:text-accent-foreground',
        className
      )}
      {...props}
    />
  );
}

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuPortal,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuRadioGroup,
};
