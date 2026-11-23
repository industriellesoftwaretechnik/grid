import { useState, type CSSProperties, type ReactNode } from 'react';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FlexRender, type SortDirection } from '@tanstack/react-table';
import { ArrowDown, ArrowUp, EllipsisVertical, ListFilter } from 'lucide-react';

import { FilterEditor } from '@/components/data-grid/filters';
import { ContextMenuEntries, DropdownMenuEntries } from '@/components/data-grid/menu-entries';
import { flexAlign, pinnedClassName } from '@/components/data-grid/styles';
import { ContextMenu, ContextMenuContent, ContextMenuTrigger } from '@/components/ui/context-menu';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import {
  useColumnMenu,
  useColumnResizer,
  useHeaderCell,
  useHeaderRows,
  type CoreTable,
  type GridColumn,
  type GridHeader,
  type HeaderSlot,
} from '@istec/grid';

export function HeaderRows<TData extends object>({
  table,
  headerHeight,
}: {
  table: CoreTable<TData>;
  headerHeight: number;
}) {
  return useHeaderRows(table).map((row) => (
    <tr key={row.id}>
      {row.slots.map((slot) =>
        slot === 'filler' ? (
          <th key="filler" aria-hidden />
        ) : (
          <HeaderCell key={slot.header.id} slot={slot} height={headerHeight} />
        )
      )}
    </tr>
  ));
}

const iconButtonClassName =
  'flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-sm text-muted-foreground outline-none hover:bg-foreground/10 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 aria-expanded:bg-foreground/10 aria-expanded:text-foreground [&_svg]:size-3.5';

// Keeps a press on a button inside the header from starting a column drag.
const stopDrag = { onPointerDown: (event: { stopPropagation: () => void }) => event.stopPropagation() };

/**
 * A header cell. A column's label sorts; beside it, a filter button while a filter is set and the menu button, which
 * narrow columns leave out. A right click opens the menu too. Scrolling columns are dragged to reorder them.
 */
function HeaderCell<TData extends object>({ slot, height }: { slot: HeaderSlot<TData>; height: number }) {
  const model = useHeaderCell(slot);
  const { header, region, edge } = slot;
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: header.id,
    disabled: !model.reorderable,
  });
  // The cell keeps its columnheader role; dnd-kit's role="button" would hide it from screen readers.
  const { role: _role, ...dragAttributes } = attributes;
  const [cell, setCell] = useState<HTMLTableCellElement | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  // Only the sideways move shows; dragged up into the group panel, the column follows as the drag overlay.
  const style: CSSProperties = {
    height,
    ...model.cellProps.style,
    transform: CSS.Translate.toString(transform && { ...transform, y: 0 }),
    transition,
  };

  return (
    <th
      {...model.cellProps}
      {...(model.reorderable ? { ...dragAttributes, ...listeners } : {})}
      ref={(node) => {
        setNodeRef(node);
        // Keys pressed on the buttons inside bubble up here; only keys on the cell itself start a drag.
        setActivatorNodeRef(node);
        setCell(node);
      }}
      style={style}
      className={cn(
        'group relative text-left align-middle font-medium whitespace-nowrap text-foreground',
        model.kind === 'group' && 'border-b',
        // Pinned headers keep the header's background over the pinned cells' one.
        pinnedClassName(region, edge),
        'bg-muted',
        model.reorderable &&
          'outline-none focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-primary focus-visible:outline-solid',
        isDragging && 'z-20 bg-background opacity-90 shadow-sm',
        model.className
      )}
    >
      {model.kind === 'group' ? (
        <div className="flex h-full items-center px-2">
          <span className="truncate">
            <FlexRender header={header} />
          </span>
        </div>
      ) : model.kind === 'column' ? (
        <Popover open={filterOpen} onOpenChange={setFilterOpen}>
          <ColumnContent
            column={header.column}
            enabled={model.hasMenu}
            onFilter={() => setFilterOpen(true)}
            className={cn('flex h-full items-center gap-1 px-2', flexAlign[model.align])}
          >
            <HeaderLabel slot={slot} reverse={model.align === 'end'} />
            {model.filter && model.filtered && (
              <PopoverTrigger
                {...stopDrag}
                aria-label={model.labels.filter}
                className={cn(iconButtonClassName, 'bg-primary/15 text-primary hover:bg-primary/25 hover:text-primary')}
              >
                <ListFilter />
              </PopoverTrigger>
            )}
            {model.showMenuButton && (
              <ColumnMenuButton column={header.column} label={model.labels.menu} onFilter={() => setFilterOpen(true)} />
            )}
          </ColumnContent>
          {model.filter && (
            <PopoverContent anchor={cell} align="start" className="w-64 gap-2 p-2" {...stopDrag}>
              <FilterEditor column={header.column} kind={model.filter} />
            </PopoverContent>
          )}
        </Popover>
      ) : null}
      <ColumnResizer header={header} />
    </th>
  );
}

/** The header's label; a button that sorts where the column can be sorted. End-aligned labels sit at the right. */
function HeaderLabel<TData extends object>({
  slot: { header, toggleSorting, sorted, sortPosition },
  reverse,
}: {
  slot: HeaderSlot<TData>;
  reverse: boolean;
}) {
  const label = (
    <span className="truncate">
      <FlexRender header={header} />
    </span>
  );

  const className = cn(
    'flex min-w-0 flex-1 items-center gap-1 text-left [&_svg]:size-3.5 [&_svg]:shrink-0',
    reverse && 'flex-row-reverse text-right'
  );
  if (!toggleSorting) return <span className={className}>{label}</span>;

  return (
    <button type="button" onClick={toggleSorting} className={cn(className, 'cursor-pointer')}>
      {label}
      <SortIndicator sorted={sorted} position={sortPosition} />
    </button>
  );
}

/** The direction a column is sorted in, with its place in a multi-sort; nothing while it is not sorted. */
export function SortIndicator({ sorted, position }: { sorted: false | SortDirection; position: number }) {
  if (!sorted) return null;

  return (
    <span className="flex items-center [&_svg]:size-3.5">
      {sorted === 'asc' ? <ArrowUp /> : <ArrowDown />}
      {position > 0 && <span className="text-[10px] leading-none text-muted-foreground tabular-nums">{position}</span>}
    </span>
  );
}

/** The header's content, which a right click opens the column menu on. */
function ColumnContent<TData extends object>({
  column,
  enabled,
  onFilter,
  className,
  children,
}: {
  column: GridColumn<TData>;
  enabled: boolean;
  onFilter: () => void;
  className: string;
  children: ReactNode;
}) {
  if (!enabled) return <div className={className}>{children}</div>;

  return (
    <ContextMenu>
      <ContextMenuTrigger className={className}>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-52" {...stopDrag}>
        <ColumnMenuEntries column={column} onFilter={onFilter} variant="context" />
      </ContextMenuContent>
    </ContextMenu>
  );
}

function ColumnMenuButton<TData extends object>({
  column,
  label,
  onFilter,
}: {
  column: GridColumn<TData>;
  label: string;
  onFilter: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger {...stopDrag} aria-label={label} className={iconButtonClassName}>
        <EllipsisVertical />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52" {...stopDrag}>
        <ColumnMenuEntries column={column} onFilter={onFilter} variant="dropdown" />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Rendered only while the menu is open, and kept current while it is.
function ColumnMenuEntries<TData extends object>({
  column,
  onFilter,
  variant,
}: {
  column: GridColumn<TData>;
  onFilter: () => void;
  variant: 'context' | 'dropdown';
}) {
  const sections = useColumnMenu(column, { onFilter });
  return variant === 'context' ? (
    <ContextMenuEntries sections={sections} />
  ) : (
    <DropdownMenuEntries sections={sections} />
  );
}

/** The divider at a header's right edge; it is the resize handle where the column can be resized. */
function ColumnResizer<TData extends object>({ header }: { header: GridHeader<TData> }) {
  const { canResize, resizing, handleProps } = useColumnResizer(header);
  const line = (
    <div
      className={cn(
        'h-1/2 w-px bg-border transition-[height]',
        resizing ? 'h-full bg-primary' : 'group-hover/divider:h-full group-hover/divider:bg-primary/60'
      )}
    />
  );

  if (!canResize) return <div className="absolute top-0 -right-px flex h-full items-center">{line}</div>;

  return (
    <div
      {...handleProps}
      {...stopDrag}
      className="group/divider absolute top-0 -right-1.5 z-10 flex h-full w-3 cursor-col-resize touch-none items-center justify-center select-none"
    >
      {line}
    </div>
  );
}
