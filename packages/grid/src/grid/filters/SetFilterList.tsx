import type { SetFilterOption } from '#/grid/filters/setFilter.ts';
import { useVirtualList } from '#/grid/filters/useVirtualList.ts';
import { Checkbox } from '#/internal/components/checkbox.tsx';

export function SetFilterList({
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
              className="ig:flex ig:cursor-pointer ig:items-center ig:gap-2 ig:rounded-sm ig:px-2 ig:hover:bg-muted"
            >
              <Checkbox checked={isChecked(option)} onCheckedChange={(checked) => onToggle(option, checked)} />
              <span className="ig:min-w-0 ig:flex-1 ig:truncate">{option.label}</span>
              <span className="ig:text-muted-foreground ig:tabular-nums">{option.count}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
