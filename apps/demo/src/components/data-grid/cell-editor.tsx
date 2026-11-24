import { Check } from 'lucide-react';

import { editorErrorText, messages } from '@/components/data-grid/messages';
import { Popover, PopoverContent } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useCellEditor, useVirtualList, type CellEditorModel, type GridCell } from '@istec/grid';

const inputClassName = 'h-full w-full min-w-0 bg-background px-2 text-xs outline-none';

/** Renders inside the edited cell. */
export function CellEditor<TData extends object>({ cell }: { cell: GridCell<TData> }) {
  const editor = useCellEditor(cell);
  const { kind, custom, error, input, inputProps } = editor;

  if (custom !== undefined) return <div className="h-full w-full">{custom}</div>;

  return (
    <>
      <input
        {...inputProps}
        aria-label={messages.editValue}
        className={cn(inputClassName, kind === 'number' && 'text-right')}
      />
      {kind === 'select' && (
        <Popover open>
          <PopoverContent
            anchor={input}
            align="start"
            initialFocus={false}
            finalFocus={false}
            className="w-auto min-w-48 gap-0 p-1"
          >
            <ChoiceList editor={editor} />
          </PopoverContent>
        </Popover>
      )}
      {error !== undefined && (
        <div
          role="alert"
          className="absolute top-full left-0 z-30 mt-0.5 rounded-sm bg-destructive px-2 py-1 whitespace-nowrap text-white shadow-sm"
        >
          {editorErrorText(error)}
        </div>
      )}
    </>
  );
}

function ChoiceList({ editor: { choices, activeIndex, listProps, choiceProps } }: { editor: CellEditorModel }) {
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
              className="flex cursor-pointer items-center gap-2 rounded-sm px-2 aria-selected:bg-accent aria-selected:text-accent-foreground"
            >
              <span className="min-w-0 flex-1 truncate">{choice.label}</span>
              {choice.current && <Check className="size-3.5 shrink-0" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
