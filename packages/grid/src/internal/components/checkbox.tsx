import { Checkbox as CheckboxPrimitive } from '@base-ui/react/checkbox';
import { cn } from 'cn';
import { CheckIcon, MinusIcon } from 'lucide-react';

function Checkbox({ className, ...props }: CheckboxPrimitive.Root.Props) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        'ig:peer ig:group/checkbox ig:relative ig:flex ig:size-4 ig:shrink-0 ig:items-center ig:justify-center ig:rounded-[4px] ig:border ig:border-input ig:transition-shadow ig:outline-none ig:group-has-disabled/field:opacity-50 ig:group-has-[:focus-visible]/field-label:ring-0 ig:group-has-[:focus-visible]/field-label:not-data-checked:border-input ig:after:absolute ig:after:-inset-x-3 ig:after:-inset-y-2 ig:focus-visible:border-ring ig:focus-visible:ring-2 ig:focus-visible:ring-ring/30 ig:disabled:cursor-not-allowed ig:disabled:opacity-50 ig:aria-invalid:border-destructive ig:aria-invalid:ring-2 ig:aria-invalid:ring-destructive/20 ig:aria-invalid:aria-checked:border-primary ig:data-indeterminate:border-primary ig:data-indeterminate:text-primary ig:dark:bg-input/30 ig:dark:aria-invalid:border-destructive/50 ig:dark:aria-invalid:ring-destructive/40 ig:data-checked:border-primary ig:data-checked:bg-primary ig:data-checked:text-primary-foreground ig:group-has-[:focus-visible]/field-label:data-checked:border-primary ig:dark:data-checked:bg-primary',
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="ig:grid ig:place-content-center ig:text-current ig:transition-none ig:[&>svg]:size-3.5"
      >
        <CheckIcon className="ig:group-data-indeterminate/checkbox:hidden" />
        <MinusIcon className="ig:hidden ig:group-data-indeterminate/checkbox:block" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
