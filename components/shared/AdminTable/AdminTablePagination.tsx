'use client';

import {Group, Pagination, Select, Text} from '@mantine/core';

const PAGE_SIZE_OPTIONS = ['5', '10', '20', '25', '50'];

type AdminTablePaginationProps = {
  /** Stable HTML id prefix (from useId). */
  idPrefix: string;
  /** Current page (1-based). */
  page: number;
  /** Total number of pages. */
  totalPages: number;
  /** Current page size. */
  pageSize: number;
  /** Number of items on the current page. */
  currentPageItemCount: number;
  /** Total number of filtered items. */
  filteredTotal: number;
  /** Called when user changes page. */
  onPageChange: (page: number) => void;
  /** Called when user changes page size. */
  onPageSizeChange: (value: string | null) => void;
};

export function AdminTablePagination({
  idPrefix,
  page,
  totalPages,
  pageSize,
  currentPageItemCount,
  filteredTotal,
  onPageChange,
  onPageSizeChange,
}: AdminTablePaginationProps) {
  const clampedPage = Math.min(page, totalPages);
  const hasItems =
    filteredTotal > 0 && currentPageItemCount > 0 && totalPages > 0;
  const startIndex = hasItems ? (clampedPage - 1) * pageSize + 1 : 0;
  const endIndex = hasItems
    ? (clampedPage - 1) * pageSize + currentPageItemCount
    : 0;

  return (
    <Group justify="space-between" align="center" mt="md">
      <Group gap="xs" align="center">
        <Text size="sm" c="dimmed">
          {`Zobrazeno ${startIndex}–${endIndex} z ${filteredTotal}`}
        </Text>
        <Select
          id={`${idPrefix}-page-size`}
          data={PAGE_SIZE_OPTIONS}
          value={String(pageSize)}
          onChange={onPageSizeChange}
          size="xs"
          w={70}
          allowDeselect={false}
        />
        <Text size="sm" c="dimmed">
          na stránku
        </Text>
      </Group>

      {totalPages > 1 && (
        <Pagination
          total={totalPages}
          value={page}
          onChange={onPageChange}
          size="sm"
        />
      )}
    </Group>
  );
}
