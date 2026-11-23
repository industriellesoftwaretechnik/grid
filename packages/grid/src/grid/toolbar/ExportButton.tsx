import { Download } from 'lucide-react';

import { gridMeta } from '#/core/gridMeta.ts';
import { useTableContext } from '#/core/tableContext.ts';
import { useTranslate } from '#/hooks/useTranslate.ts';
import { Button } from '#/internal/components/button.tsx';
import { downloadCsv } from '#/logic/export/csvExport.ts';

/**
 * Downloads the rows that pass the filters as CSV, named after the table unless `fileName` is given. Place it inside
 * the grid, such as in `DataGrid`'s `toolbar`.
 */
export function ExportButton({ fileName }: { fileName?: string }) {
  const table = useTableContext();
  const t = useTranslate(table);

  return (
    <Button variant="outline" onClick={() => downloadCsv(table, { fileName: fileName ?? gridMeta(table).tableId })}>
      <Download />
      {t('export')}
    </Button>
  );
}
