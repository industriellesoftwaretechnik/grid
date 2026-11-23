import * as React from 'react';

import { Input as InputPrimitive } from '@base-ui/react/input';
import { cn } from 'cn';

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        'ig:h-7 ig:w-full ig:min-w-0 ig:rounded-md ig:border ig:border-input ig:bg-input/20 ig:px-2 ig:py-0.5 ig:text-sm ig:transition-colors ig:outline-none ig:file:inline-flex ig:file:h-6 ig:file:border-0 ig:file:bg-transparent ig:file:text-xs/relaxed ig:file:font-medium ig:file:text-foreground ig:placeholder:text-muted-foreground ig:focus-visible:border-ring ig:focus-visible:ring-2 ig:focus-visible:ring-ring/30 ig:disabled:pointer-events-none ig:disabled:cursor-not-allowed ig:disabled:opacity-50 ig:aria-invalid:border-destructive ig:aria-invalid:ring-2 ig:aria-invalid:ring-destructive/20 ig:md:text-xs/relaxed ig:dark:bg-input/30 ig:dark:aria-invalid:border-destructive/50 ig:dark:aria-invalid:ring-destructive/40',
        className
      )}
      {...props}
    />
  );
}

export { Input };
