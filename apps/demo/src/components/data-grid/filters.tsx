import { useId, useState } from 'react';

import { ListFilter, Search, X } from 'lucide-react';

import { filterSummaryText, messages } from '@/components/data-grid/messages';
import { pinnedClassName } from '@/components/data-grid/styles';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import {
  columnLabel,
  textCodec,
  useFilterInput,
  useFloatingFilter,
  useHeaderRows,
  useRangeFilter,
  useSetFilter,
  useVirtualList,
  type CoreTable,
  type FilterKind,
  type GridColumn,
  type SetFilterOption,
} from '@istec/grid';

export function FilterEditor<TData extends object>({ column, kind }: { column: GridColumn<TData>; kind: FilterKind }) {
  if (kind === 'text') return <TextFilter column={column} />;
  if (kind === 'set') return <SetFilter column={column} />;
  return <RangeFilter column={column} type={kind} />;
}

function ClearFilterButton({ enabled, onClear }: { enabled: boolean; onClear: () => void }) {
  return (
    <Button variant="ghost" size="sm" className="self-end" disabled={!enabled} onClick={onClear}>
      <X />
      {messages.clearFilter}
    </Button>
  );
}

function TextFilter<TData extends object>({ column }: { column: GridColumn<TData> }) {
  const filter = useFilterInput(column, textCodec);

  return (
    <>
      <Input
        aria-label={messages.textFilter}
        placeholder={messages.textFilter}
        value={filter.text}
        onChange={(event) => filter.change(event.target.value)}
      />
      <ClearFilterButton enabled={filter.canClear} onClear={filter.clear} />
    </>
  );
}

function RangeFilter<TData extends object>({ column, type }: { column: GridColumn<TData>; type: 'number' | 'date' }) {
  const filter = useRangeFilter(column, type);
  const id = useId();
  const labels = type === 'number' ? messages.numberBounds : messages.dateBounds;

  return (
    <>
      <div className="grid grid-cols-[auto_1fr] items-center gap-x-2 gap-y-1.5">
        {([0, 1] as const).map((bound) => (
          <div key={bound} className="contents">
            <Label htmlFor={`${id}-${bound}`}>{labels[bound]}</Label>
            <Input
              id={`${id}-${bound}`}
              type={type}
              value={filter.text[bound]}
              placeholder={filter.placeholders?.[bound]}
              onChange={(event) =>
                filter.change(bound === 0 ? [event.target.value, filter.text[1]] : [filter.text[0], event.target.value])
              }
            />
          </div>
        ))}
      </div>
      <ClearFilterButton enabled={filter.canClear} onClear={filter.clear} />
    </>
  );
}

function SetFilter<TData extends object>({ column }: { column: GridColumn<TData> }) {
  const filter = useSetFilter(column);

  return (
    <>
      <InputGroup>
        <InputGroupAddon>
          <Search />
        </InputGroupAddon>
        <InputGroupInput
          type="search"
          aria-label={messages.searchValues}
          placeholder={messages.searchValues}
          value={filter.query}
          onChange={(event) => filter.setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') filter.keepFound();
          }}
        />
      </InputGroup>
      <div className="flex flex-col gap-0.5">
        <label className="flex h-8 cursor-pointer items-center gap-2 rounded-sm border-b px-2 font-medium hover:bg-muted">
          <Checkbox
            checked={filter.selectAll.checked}
            indeterminate={filter.selectAll.indeterminate}
            disabled={filter.selectAll.disabled}
            onCheckedChange={() => filter.toggleAll(!filter.selectAll.checked)}
          />
          {messages.selectAllValues}
        </label>
        <SetFilterList
          options={filter.options}
          isChecked={filter.isChecked}
          onToggle={(option, checked) => filter.toggle([option], checked)}
        />
      </div>
      <ClearFilterButton enabled={filter.canClear} onClear={filter.clear} />
    </>
  );
}

function SetFilterList({
  options,
  isChecked,
  onToggle,
}: {
  options: SetFilterOption[];
  isChecked: (option: SetFilterOption) => boolean;
  onToggle: (option: SetFilterOption, checked: boolean) => void;
}) {
  const list = useVirtualList(options.length, { itemHeight: 30, maxHeight: 320 });

  return (
    <div {...list.scrollProps}>
      <div style={list.contentStyle}>
        {list.items.map((item) => {
          const option = options[item.index];
          if (!option) return null;
          return (
            <label
              key={option.key}
              style={item.style}
              className="flex cursor-pointer items-center gap-2 rounded-sm px-2 hover:bg-muted"
            >
              <Checkbox checked={isChecked(option)} onCheckedChange={(checked) => onToggle(option, checked)} />
              <span className="min-w-0 flex-1 truncate">{option.blank ? messages.blank : option.label}</span>
              <span className="text-muted-foreground tabular-nums">{option.count}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

const fieldClassName =
  'h-6 w-full min-w-0 rounded-sm border bg-background px-1.5 font-normal outline-none focus-visible:ring-1 focus-visible:ring-primary aria-invalid:border-destructive';

export function FloatingFilterRow<TData extends object>({
  table,
  height,
}: {
  table: CoreTable<TData>;
  height: number;
}) {
  const leafRow = useHeaderRows(table).at(-1);
  if (!leafRow) return null;

  return (
    <tr>
      {leafRow.slots.map((slot) =>
        slot === 'filler' ? (
          <th key="filler" aria-hidden className="border-t" />
        ) : (
          <th
            key={slot.header.id}
            style={{ height, ...slot.style }}
            className={cn('border-t px-1 align-middle', pinnedClassName(slot.region, slot.edge), 'bg-muted')}
          >
            <FloatingFilter column={slot.header.column} />
          </th>
        )
      )}
    </tr>
  );
}

function FloatingFilter<TData extends object>({ column }: { column: GridColumn<TData> }) {
  const filter = useFloatingFilter(column);
  const [open, setOpen] = useState(false);
  if (filter.mode === 'none' || !filter.filter) return null;
  const label = `${messages.filter}: ${columnLabel(column)}`;

  if (filter.mode === 'typed') {
    return (
      <input
        type="search"
        aria-label={label}
        aria-invalid={filter.invalid || undefined}
        title={filter.filter === 'number' ? messages.numberHint : undefined}
        value={filter.text}
        onChange={(event) => filter.change(event.target.value)}
        className={fieldClassName}
      />
    );
  }

  const summary = filterSummaryText(filter.summary);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        aria-label={label}
        title={summary || undefined}
        className={cn(fieldClassName, 'flex cursor-pointer items-center gap-1 text-left')}
      >
        <span className="min-w-0 flex-1 truncate">{summary}</span>
        <ListFilter className={cn('size-3.5 shrink-0', summary === '' ? 'text-muted-foreground' : 'text-primary')} />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 gap-2 p-2">
        <FilterEditor column={column} kind={filter.filter} />
      </PopoverContent>
    </Popover>
  );
}
