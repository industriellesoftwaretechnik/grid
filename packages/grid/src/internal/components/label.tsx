import * as React from 'react';

import { cn } from 'cn';

function Label({ className, ...props }: React.ComponentProps<'label'>) {
  return (
    <label
      data-slot="label"
      className={cn(
        'ig:flex ig:items-center ig:gap-2 ig:text-xs/relaxed ig:leading-none ig:font-medium ig:select-none ig:group-data-[disabled=true]:pointer-events-none ig:group-data-[disabled=true]:opacity-50 ig:peer-disabled:cursor-not-allowed ig:peer-disabled:opacity-50',
        className
      )}
      {...props}
    />
  );
}

export { Label };
