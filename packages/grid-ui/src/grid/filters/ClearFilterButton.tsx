import { X } from 'lucide-react';

import { Button } from '#/internal/components/button.tsx';

export function ClearFilterButton({
  label,
  enabled,
  onClear,
}: {
  label: string;
  enabled: boolean;
  onClear: () => void;
}) {
  return (
    <Button variant="ghost" size="sm" className="self-end" disabled={!enabled} onClick={onClear}>
      <X />
      {label}
    </Button>
  );
}
