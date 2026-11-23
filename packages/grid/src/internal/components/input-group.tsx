import * as React from 'react';

import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from 'cn';

import { Button } from '#/internal/components/button.tsx';
import { Input } from '#/internal/components/input.tsx';

function InputGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="input-group"
      role="group"
      className={cn(
        'ig:group/input-group ig:relative ig:flex ig:h-7 ig:w-full ig:min-w-0 ig:items-center ig:rounded-md ig:border ig:border-input ig:bg-input/20 ig:transition-colors ig:outline-none ig:in-data-[slot=combobox-content]:focus-within:border-inherit ig:in-data-[slot=combobox-content]:focus-within:ring-0 ig:has-data-[align=block-end]:rounded-md ig:has-data-[align=block-start]:rounded-md ig:has-[[data-slot=input-group-control]:focus-visible]:border-ring ig:has-[[data-slot=input-group-control]:focus-visible]:ring-2 ig:has-[[data-slot=input-group-control]:focus-visible]:ring-ring/30 ig:has-[[data-slot][aria-invalid=true]]:border-destructive ig:has-[[data-slot][aria-invalid=true]]:ring-2 ig:has-[[data-slot][aria-invalid=true]]:ring-destructive/20 ig:has-[textarea]:rounded-md ig:has-[>[data-align=block-end]]:h-auto ig:has-[>[data-align=block-end]]:flex-col ig:has-[>[data-align=block-start]]:h-auto ig:has-[>[data-align=block-start]]:flex-col ig:has-[>textarea]:h-auto ig:dark:bg-input/30 ig:dark:has-[[data-slot][aria-invalid=true]]:ring-destructive/40 ig:has-[>[data-align=block-end]]:[&>input]:pt-3 ig:has-[>[data-align=block-start]]:[&>input]:pb-3 ig:has-[>[data-align=inline-end]]:[&>input]:pr-1.5 ig:has-[>[data-align=inline-start]]:[&>input]:pl-1.5',
        className
      )}
      {...props}
    />
  );
}

const inputGroupAddonVariants = cva(
  "ig:flex ig:h-auto ig:cursor-text ig:items-center ig:justify-center ig:gap-1 ig:py-2 ig:text-xs/relaxed ig:font-medium ig:text-muted-foreground ig:select-none ig:group-data-[disabled=true]/input-group:opacity-50 ig:**:data-[slot=kbd]:rounded-[calc(--theme(--radius-sm)-2px)] ig:**:data-[slot=kbd]:bg-muted-foreground/10 ig:**:data-[slot=kbd]:px-1 ig:**:data-[slot=kbd]:text-[0.625rem] ig:[&>svg:not([class*='size-'])]:size-3.5",
  {
    variants: {
      align: {
        'inline-start': 'ig:order-first ig:pl-2 ig:has-[>button]:ml-[-0.275rem] ig:has-[>kbd]:ml-[-0.275rem]',
        'inline-end': 'ig:order-last ig:pr-2 ig:has-[>button]:mr-[-0.275rem] ig:has-[>kbd]:mr-[-0.275rem]',
        'block-start':
          'ig:order-first ig:w-full ig:justify-start ig:px-2 ig:pt-2 ig:group-has-[>input]/input-group:pt-2 ig:[.border-b]:pb-2',
        'block-end':
          'ig:order-last ig:w-full ig:justify-start ig:px-2 ig:pb-2 ig:group-has-[>input]/input-group:pb-2 ig:[.border-t]:pt-2',
      },
    },
    defaultVariants: {
      align: 'inline-start',
    },
  }
);

function InputGroupAddon({
  className,
  align = 'inline-start',
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof inputGroupAddonVariants>) {
  return (
    <div
      role="group"
      data-slot="input-group-addon"
      data-align={align}
      className={cn(inputGroupAddonVariants({ align }), className)}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('button')) {
          return;
        }
        e.currentTarget.parentElement?.querySelector('input')?.focus();
      }}
      {...props}
    />
  );
}

const inputGroupButtonVariants = cva(
  'ig:flex ig:items-center ig:gap-2 ig:rounded-md ig:text-xs/relaxed ig:shadow-none',
  {
    variants: {
      size: {
        xs: "ig:h-5 ig:gap-1 ig:rounded-[calc(--theme(--radius-sm)-2px)] ig:px-1 ig:[&>svg:not([class*='size-'])]:size-3",
        sm: 'ig:gap-1',
        'icon-xs': 'ig:size-6 ig:p-0 ig:has-[>svg]:p-0',
        'icon-sm': 'ig:size-7 ig:p-0 ig:has-[>svg]:p-0',
      },
    },
    defaultVariants: {
      size: 'xs',
    },
  }
);

function InputGroupButton({
  className,
  type = 'button',
  variant = 'ghost',
  size = 'xs',
  ...props
}: Omit<React.ComponentProps<typeof Button>, 'size' | 'type'> &
  VariantProps<typeof inputGroupButtonVariants> & {
    type?: 'button' | 'submit' | 'reset';
  }) {
  return (
    <Button
      type={type}
      data-size={size}
      variant={variant}
      className={cn(inputGroupButtonVariants({ size }), className)}
      {...props}
    />
  );
}

function InputGroupText({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      className={cn(
        "ig:flex ig:items-center ig:gap-2 ig:text-xs/relaxed ig:text-muted-foreground ig:[&_svg]:pointer-events-none ig:[&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  );
}

function InputGroupInput({ className, ...props }: React.ComponentProps<'input'>) {
  return (
    <Input
      data-slot="input-group-control"
      className={cn(
        'ig:flex-1 ig:rounded-none ig:border-0 ig:bg-transparent ig:shadow-none ig:ring-0 ig:focus-visible:ring-0 ig:aria-invalid:ring-0 ig:dark:bg-transparent',
        className
      )}
      {...props}
    />
  );
}

export { InputGroup, InputGroupAddon, InputGroupButton, InputGroupText, InputGroupInput };
