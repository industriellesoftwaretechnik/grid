import { Fragment, type ComponentType, type ReactNode } from 'react';

import {
  ArrowDown,
  ArrowUp,
  ClipboardPaste,
  Copy,
  EyeOff,
  Group as GroupIcon,
  ListFilter,
  Pin,
  RotateCcw,
  Sigma,
  X,
  type LucideIcon,
} from 'lucide-react';

import { aggregationSymbols, menuLabels, menuShortcuts } from '@/components/data-grid/messages';
import {
  ContextMenuCheckboxItem,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
} from '@/components/ui/context-menu';
import {
  DropdownMenuCheckboxItem,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import type { GridMenuEntry, GridMenuId, GridMenuSection } from '@istec/grid';

const icons: Partial<Record<GridMenuId, LucideIcon>> = {
  'sort.asc': ArrowUp,
  'sort.desc': ArrowDown,
  'sort.clear': X,
  filter: ListFilter,
  'filter.clear': X,
  pin: Pin,
  'group.by': GroupIcon,
  'group.remove': GroupIcon,
  aggregation: Sigma,
  'column.hide': EyeOff,
  'columns.reset': RotateCcw,
  copy: Copy,
  'copy.with-headers': Copy,
  paste: ClipboardPaste,
};

const isGridMenuId = (id: string): id is GridMenuId => Object.hasOwn(menuLabels, id);

/** An entry's text: its own label, else the grid's text for its id. */
const entryLabel = (entry: GridMenuEntry) => entry.label ?? (isGridMenuId(entry.id) ? menuLabels[entry.id] : entry.id);

// An aggregation's item ends with its mark, as the cells show it.
const aggregationHints: Record<string, string> = Object.fromEntries(
  Object.entries(aggregationSymbols).map(([name, symbol]) => [`aggregation.${name}`, symbol])
);

const entryHint = (entry: GridMenuEntry) =>
  (entry.type === 'item' ? entry.hint : undefined) ?? aggregationHints[entry.id];

function EntryIcon({ entry }: { entry: GridMenuEntry }): ReactNode {
  if (entry.icon !== undefined) return entry.icon;
  const Icon = isGridMenuId(entry.id) ? icons[entry.id] : undefined;
  return Icon ? <Icon /> : null;
}

/** The parts of a shadcn menu, which the context menu and the dropdown menu both have. */
interface MenuParts {
  Group: ComponentType<{ children: ReactNode }>;
  Item: ComponentType<{ disabled?: boolean; closeOnClick?: boolean; onClick?: () => void; children: ReactNode }>;
  CheckboxItem: ComponentType<{
    checked: boolean;
    disabled?: boolean;
    closeOnClick?: boolean;
    onCheckedChange: () => void;
    children: ReactNode;
  }>;
  Separator: ComponentType;
  Shortcut: ComponentType<{ children: ReactNode }>;
  Sub: ComponentType<{ children: ReactNode }>;
  SubTrigger: ComponentType<{ children: ReactNode }>;
  SubContent: ComponentType<{ className?: string; children: ReactNode }>;
}

function menuEntries(sections: GridMenuSection[], parts: MenuParts): ReactNode {
  const { Group, Item, CheckboxItem, Separator, Shortcut, Sub, SubTrigger, SubContent } = parts;
  return sections.map((section, index) => (
    <Fragment key={section.id}>
      {index > 0 && <Separator />}
      <Group>
        {section.entries.map((entry) => {
          if (entry.type === 'submenu') {
            return (
              <Sub key={entry.id}>
                <SubTrigger>
                  <EntryIcon entry={entry} />
                  {entryLabel(entry)}
                </SubTrigger>
                <SubContent className="min-w-40">{menuEntries(entry.sections, parts)}</SubContent>
              </Sub>
            );
          }
          const hint = entryHint(entry);
          const shortcut = entry.shortcut ?? (isGridMenuId(entry.id) ? menuShortcuts[entry.id] : undefined);
          const content = (
            <>
              {entry.checked === undefined && <EntryIcon entry={entry} />}
              {entryLabel(entry)}
              {/* A hint, such as an aggregation's mark, looks as it does in the cells; a shortcut as shortcuts do. */}
              {hint !== undefined && <span className="ml-auto pl-4 text-muted-foreground">{hint}</span>}
              {hint === undefined && shortcut !== undefined && <Shortcut>{shortcut}</Shortcut>}
            </>
          );
          return entry.checked === undefined ? (
            <Item key={entry.id} disabled={entry.disabled} closeOnClick={!entry.keepOpen} onClick={entry.onSelect}>
              {content}
            </Item>
          ) : (
            <CheckboxItem
              key={entry.id}
              checked={entry.checked}
              disabled={entry.disabled}
              closeOnClick={!entry.keepOpen}
              onCheckedChange={entry.onSelect}
            >
              {content}
            </CheckboxItem>
          );
        })}
      </Group>
    </Fragment>
  ));
}

const contextMenuParts: MenuParts = {
  Group: ContextMenuGroup,
  Item: ContextMenuItem,
  CheckboxItem: ContextMenuCheckboxItem,
  Separator: ContextMenuSeparator,
  Shortcut: ContextMenuShortcut,
  Sub: ContextMenuSub,
  SubTrigger: ContextMenuSubTrigger,
  SubContent: ContextMenuSubContent,
};

const dropdownMenuParts: MenuParts = {
  Group: DropdownMenuGroup,
  Item: DropdownMenuItem,
  CheckboxItem: DropdownMenuCheckboxItem,
  Separator: DropdownMenuSeparator,
  Shortcut: DropdownMenuShortcut,
  Sub: DropdownMenuSub,
  SubTrigger: DropdownMenuSubTrigger,
  SubContent: DropdownMenuSubContent,
};

/** A grid menu's sections as context menu items, with a separator between sections. */
export function ContextMenuEntries({ sections }: { sections: GridMenuSection[] }) {
  return menuEntries(sections, contextMenuParts);
}

/** A grid menu's sections as dropdown menu items, with a separator between sections. */
export function DropdownMenuEntries({ sections }: { sections: GridMenuSection[] }) {
  return menuEntries(sections, dropdownMenuParts);
}
