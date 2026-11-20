import { Checkbox } from '#/internal/components/checkbox.tsx';
import { useVirtualList, type SetFilterOption } from '@istec/grid-core';

export function SetFilterList({
  options,
  isChecked,
  onToggle,
}: {
  options: SetFilterOption[];
  isChecked: (option: SetFilterOption) => boolean;
  onToggle: (option: SetFilterOption, checked: boolean) => void;
}) {
  'use no memo';
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
              <span className="min-w-0 flex-1 truncate">{option.label}</span>
              <span className="text-muted-foreground tabular-nums">{option.count}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
