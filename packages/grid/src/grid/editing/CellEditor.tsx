import type { RowData } from '@tanstack/react-table';
import { cn } from 'cn';
import { Check } from 'lucide-react';

import type { GridCell } from '#/core/types.ts';
import { useCellEditor, type EditorChoice } from '#/grid/editing/useCellEditor.ts';
import { useVirtualList } from '#/grid/filters/useVirtualList.ts';
import { Popover, PopoverContent } from '#/internal/components/popover.tsx';

const inputClassName = 'ig:h-full ig:w-full ig:min-w-0 ig:bg-background ig:px-2 ig:text-xs ig:outline-none';

/** Renders inside the edited cell. */
export function CellEditor<TData extends RowData>({ cell }: { cell: GridCell<TData> }) {
  const editor = useCellEditor(cell);
  const { kind, custom, error, inputProps } = editor;

  if (custom !== undefined) return <div className="ig:h-full ig:w-full">{custom}</div>;

  return (
    <>
      <input {...inputProps} className={cn(inputClassName, kind === 'number' && 'ig:text-right')} />
      {kind === 'select' && (
        <Popover open>
          <PopoverContent
            anchor={inputProps.ref}
            align="start"
            initialFocus={false}
            finalFocus={false}
            className="ig:w-auto ig:min-w-48 ig:gap-0 ig:p-1"
          >
            <ChoiceList {...editor} />
          </PopoverContent>
        </Popover>
      )}
      {error !== undefined && (
        <div
          role="alert"
          className="ig:absolute ig:top-full ig:left-0 ig:z-30 ig:mt-0.5 ig:rounded-sm ig:bg-destructive ig:px-2 ig:py-1 ig:whitespace-nowrap ig:text-white ig:shadow-sm"
        >
          {error}
        </div>
      )}
    </>
  );
}

function ChoiceList({
  choices,
  activeIndex,
  listProps,
  choiceProps,
}: Pick<ReturnType<typeof useCellEditor>, 'listProps' | 'choiceProps' | 'activeIndex'> & {
  choices: EditorChoice[];
}) {
  const list = useVirtualList(choices.length, { itemHeight: 28, maxHeight: 280, activeIndex });

  return (
    <div {...listProps} {...list.scrollProps}>
      <div style={list.contentStyle}>
        {list.items.map((item) => {
          const choice = choices[item.index];
          if (!choice) return null;
          return (
            <div
              key={item.key}
              {...choiceProps(item.index)}
              style={item.style}
              className="ig:flex ig:cursor-pointer ig:items-center ig:gap-2 ig:rounded-sm ig:px-2 ig:aria-selected:bg-accent ig:aria-selected:text-accent-foreground"
            >
              <span className="ig:min-w-0 ig:flex-1 ig:truncate">{choice.label}</span>
              {choice.current && <Check className="ig:size-3.5 ig:shrink-0" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
