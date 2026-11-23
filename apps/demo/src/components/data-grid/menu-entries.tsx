import { Fragment, type ComponentType, type ReactNode } from 'react';

import {
  ArrowDown,
  ArrowUp,
  ClipboardPaste,
  Columns3,
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
import type { GridMenuEntry, GridMenuIcon, GridMenuSection } from '@istec/grid';

const icons: Record<GridMenuIcon, LucideIcon> = {
  'sort-asc': ArrowUp,
  'sort-desc': ArrowDown,
  clear: X,
  filter: ListFilter,
  pin: Pin,
  group: GroupIcon,
  aggregation: Sigma,
  hide: EyeOff,
  columns: Columns3,
  reset: RotateCcw,
  copy: Copy,
  paste: ClipboardPaste,
};

function EntryIcon({ entry }: { entry: GridMenuEntry }): ReactNode {
  if (entry.type === 'item' && entry.iconNode !== undefined) return entry.iconNode;
  if (!entry.icon) return null;
  const Icon = icons[entry.icon];
  return <Icon />;
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
                  {entry.label}
                </SubTrigger>
                <SubContent className="min-w-40">{menuEntries(entry.sections, parts)}</SubContent>
              </Sub>
            );
          }
          const content = (
            <>
              {entry.checked === undefined && <EntryIcon entry={entry} />}
              {entry.label}
              {/* A hint, such as an aggregation's mark, looks as it does in the cells; a shortcut as shortcuts do. */}
              {entry.hint !== undefined && <span className="ml-auto pl-4 text-muted-foreground">{entry.hint}</span>}
              {entry.hint === undefined && entry.shortcut !== undefined && <Shortcut>{entry.shortcut}</Shortcut>}
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
