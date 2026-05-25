import {
  IconChevronDown,
  IconChevronUp,
  IconSelector,
} from '@tabler/icons-react';

import type {SortDirection} from './AdminTable.types';

type SortIconProps = {
  columnKey: string;
  activeColumnKey: string | null;
  direction: SortDirection;
};

export function SortIcon({
  columnKey,
  activeColumnKey,
  direction,
}: SortIconProps) {
  if (activeColumnKey !== columnKey || !direction) {
    return <IconSelector size={14} style={{opacity: 0.3}} />;
  }
  return direction === 'asc' ? (
    <IconChevronUp size={14} />
  ) : (
    <IconChevronDown size={14} />
  );
}
