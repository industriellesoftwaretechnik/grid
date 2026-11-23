import { Button as ButtonPrimitive } from '@base-ui/react/button';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from 'cn';

const buttonVariants = cva(
  "ig:group/button ig:inline-flex ig:shrink-0 ig:items-center ig:justify-center ig:rounded-md ig:border ig:border-transparent ig:bg-clip-padding ig:text-xs/relaxed ig:font-medium ig:whitespace-nowrap ig:transition-all ig:outline-none ig:select-none ig:focus-visible:border-ring ig:focus-visible:ring-2 ig:focus-visible:ring-ring/30 ig:active:not-aria-[haspopup]:translate-y-px ig:disabled:pointer-events-none ig:disabled:opacity-50 ig:aria-invalid:border-destructive ig:aria-invalid:ring-2 ig:aria-invalid:ring-destructive/20 ig:dark:aria-invalid:border-destructive/50 ig:dark:aria-invalid:ring-destructive/40 ig:[&_svg]:pointer-events-none ig:[&_svg]:shrink-0 ig:[&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: 'ig:bg-primary ig:text-primary-foreground ig:hover:bg-primary/80',
        outline:
          'ig:border-border ig:hover:bg-input/50 ig:hover:text-foreground ig:aria-expanded:bg-muted ig:aria-expanded:text-foreground ig:dark:bg-input/30',
        secondary:
          'ig:bg-secondary ig:text-secondary-foreground ig:hover:bg-[color-mix(in_oklch,--theme(--color-secondary),--theme(--color-foreground)_5%)] ig:aria-expanded:bg-secondary ig:aria-expanded:text-secondary-foreground',
        ghost:
          'ig:hover:bg-muted ig:hover:text-foreground ig:aria-expanded:bg-muted ig:aria-expanded:text-foreground ig:dark:hover:bg-muted/50',
        destructive:
          'ig:bg-destructive/10 ig:text-destructive ig:hover:bg-destructive/20 ig:focus-visible:border-destructive/40 ig:focus-visible:ring-destructive/20 ig:dark:bg-destructive/20 ig:dark:hover:bg-destructive/30 ig:dark:focus-visible:ring-destructive/40',
        link: 'ig:text-primary ig:underline-offset-4 ig:hover:underline',
      },
      size: {
        default:
          "ig:h-7 ig:gap-1 ig:px-2 ig:text-xs/relaxed ig:has-data-[icon=inline-end]:pr-1.5 ig:has-data-[icon=inline-start]:pl-1.5 ig:[&_svg:not([class*='size-'])]:size-3.5",
        xs: "ig:h-5 ig:gap-1 ig:rounded-sm ig:px-2 ig:text-[0.625rem] ig:has-data-[icon=inline-end]:pr-1.5 ig:has-data-[icon=inline-start]:pl-1.5 ig:[&_svg:not([class*='size-'])]:size-2.5",
        sm: "ig:h-6 ig:gap-1 ig:px-2 ig:text-xs/relaxed ig:has-data-[icon=inline-end]:pr-1.5 ig:has-data-[icon=inline-start]:pl-1.5 ig:[&_svg:not([class*='size-'])]:size-3",
        lg: "ig:h-8 ig:gap-1 ig:px-2.5 ig:text-xs/relaxed ig:has-data-[icon=inline-end]:pr-2 ig:has-data-[icon=inline-start]:pl-2 ig:[&_svg:not([class*='size-'])]:size-4",
        icon: "ig:size-7 ig:[&_svg:not([class*='size-'])]:size-3.5",
        'icon-xs': "ig:size-5 ig:rounded-sm ig:[&_svg:not([class*='size-'])]:size-2.5",
        'icon-sm': "ig:size-6 ig:[&_svg:not([class*='size-'])]:size-3",
        'icon-lg': "ig:size-8 ig:[&_svg:not([class*='size-'])]:size-4",
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

function Button({
  className,
  variant = 'default',
  size = 'default',
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return <ButtonPrimitive data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

export { Button, buttonVariants };
