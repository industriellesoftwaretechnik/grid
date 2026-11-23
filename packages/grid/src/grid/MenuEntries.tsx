import { Fragment, type ReactNode } from 'react';

import {
  ArrowDown,
  ArrowUp,
  ClipboardPaste,
  Copy,
  EyeOff,
  Group,
  ListFilter,
  Pin,
  Sigma,
  X,
  type LucideIcon,
} from 'lucide-react';

import type { MenuEntry, MenuIcon, MenuSection } from '#/grid/menu.ts';
import {
  ContextMenuItem,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
} from '#/internal/components/context-menu.tsx';

const icons: Record<MenuIcon, LucideIcon> = {
  'sort-asc': ArrowUp,
  'sort-desc': ArrowDown,
  clear: X,
  filter: ListFilter,
  pin: Pin,
  group: Group,
  aggregation: Sigma,
  hide: EyeOff,
  copy: Copy,
  paste: ClipboardPaste,
};

function EntryIcon({ entry }: { entry: MenuEntry }): ReactNode {
  if (entry.type === 'item' && entry.iconNode !== undefined) return entry.iconNode;
  if (!entry.icon) return null;
  const Icon = icons[entry.icon];
  return <Icon />;
}

/** The sections of a menu model as context menu items, with a separator between sections. */
export function MenuEntries({ sections }: { sections: MenuSection[] }) {
  return sections.map((section, index) => (
    <Fragment key={section.id}>
      {index > 0 && <ContextMenuSeparator />}
      {section.entries.map((entry) =>
        entry.type === 'item' ? (
          <ContextMenuItem key={entry.id} disabled={entry.disabled} onClick={entry.onSelect}>
            <EntryIcon entry={entry} />
            {entry.label}
            {entry.shortcut && <ContextMenuShortcut>{entry.shortcut}</ContextMenuShortcut>}
          </ContextMenuItem>
        ) : (
          <ContextMenuSub key={entry.id}>
            <ContextMenuSubTrigger>
              <EntryIcon entry={entry} />
              {entry.label}
            </ContextMenuSubTrigger>
            <ContextMenuSubContent>
              <ContextMenuRadioGroup value={entry.value} onValueChange={(value: string) => entry.onChange(value)}>
                {entry.options.map((option) => (
                  <ContextMenuRadioItem key={option.value} value={option.value}>
                    {option.label}
                    {option.hint && <span className="ig:ml-auto ig:pl-4 ig:text-muted-foreground">{option.hint}</span>}
                  </ContextMenuRadioItem>
                ))}
              </ContextMenuRadioGroup>
            </ContextMenuSubContent>
          </ContextMenuSub>
        )
      )}
    </Fragment>
  ));
}
