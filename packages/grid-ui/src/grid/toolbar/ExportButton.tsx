import { Download } from 'lucide-react';

import { Button } from '#/internal/components/button.tsx';
import { useExportButton } from '@istec/grid-core';

/** Downloads the rows that pass the filters as CSV, named after the table unless `fileName` is given. */
export function ExportButton({ fileName }: { fileName?: string }) {
  const { label, exportCsv } = useExportButton(fileName);

  return (
    <Button variant="outline" onClick={exportCsv}>
      <Download />
      {label}
    </Button>
  );
}
