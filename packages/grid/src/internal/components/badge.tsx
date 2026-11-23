import { mergeProps } from '@base-ui/react/merge-props';
import { useRender } from '@base-ui/react/use-render';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from 'cn';

const badgeVariants = cva(
  'ig:group/badge ig:inline-flex ig:h-5 ig:w-fit ig:shrink-0 ig:items-center ig:justify-center ig:gap-1 ig:overflow-hidden ig:rounded-full ig:border ig:border-transparent ig:px-2 ig:py-0.5 ig:text-[0.625rem] ig:font-medium ig:whitespace-nowrap ig:transition-all ig:focus-visible:border-ring ig:focus-visible:ring-[3px] ig:focus-visible:ring-ring/50 ig:has-data-[icon=inline-end]:pr-1.5 ig:has-data-[icon=inline-start]:pl-1.5 ig:aria-invalid:border-destructive ig:aria-invalid:ring-destructive/20 ig:dark:aria-invalid:ring-destructive/40 ig:[&>svg]:pointer-events-none ig:[&>svg]:size-2.5!',
  {
    variants: {
      variant: {
        default: 'ig:bg-primary ig:text-primary-foreground ig:[a]:hover:bg-primary/80',
        secondary: 'ig:bg-secondary ig:text-secondary-foreground ig:[a]:hover:bg-secondary/80',
        destructive:
          'ig:bg-destructive/10 ig:text-destructive ig:focus-visible:ring-destructive/20 ig:dark:bg-destructive/20 ig:dark:focus-visible:ring-destructive/40 ig:[a]:hover:bg-destructive/20',
        outline:
          'ig:border-border ig:bg-input/20 ig:text-foreground ig:dark:bg-input/30 ig:[a]:hover:bg-muted ig:[a]:hover:text-muted-foreground',
        ghost: 'ig:hover:bg-muted ig:hover:text-muted-foreground ig:dark:hover:bg-muted/50',
        link: 'ig:text-primary ig:underline-offset-4 ig:hover:underline',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

function Badge({
  className,
  variant = 'default',
  render,
  ...props
}: useRender.ComponentProps<'span'> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: 'span',
    props: mergeProps<'span'>(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props
    ),
    render,
    state: {
      slot: 'badge',
      variant,
    },
  });
}

export { Badge, badgeVariants };
