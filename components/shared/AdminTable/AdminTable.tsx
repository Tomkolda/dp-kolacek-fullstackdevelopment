'use client';

import {Box, Group, Table, Text, TextInput, Title} from '@mantine/core';
import {IconSearch} from '@tabler/icons-react';
import {useCallback, useEffect, useId, useMemo, useState} from 'react';

import classes from './AdminTable.module.css';
import type {AdminTableProps, SortDirection} from './AdminTable.types';
import {AdminTablePagination} from './AdminTablePagination';
import {SortIcon} from './SortIcon';

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

const DEFAULT_PAGE_SIZE = 20;

/** Fallback archive detection – works for any object with an `archivedAt` field. */
function defaultIsArchived<T>(item: T): boolean {
  return (
    typeof item === 'object' &&
    item !== null &&
    'archivedAt' in item &&
    (item as Record<string, unknown>).archivedAt != null
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AdminTable<T>({
  data,
  columns,
  title,
  searchPlaceholder = 'Hledat...',
  defaultSort,
  defaultPageSize = DEFAULT_PAGE_SIZE,
  getRowKey,
  isArchived = defaultIsArchived,
  noun,
  emptyMessage,
  noSearchResultsMessage,
}: AdminTableProps<T>) {
  const id = useId();

  // ---- State ----------------------------------------------------------------

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [sortColumnKey, setSortColumnKey] = useState<string | null>(
    defaultSort?.columnKey ?? null,
  );
  const [sortDirection, setSortDirection] = useState<SortDirection>(
    defaultSort?.direction ?? null,
  );

  // ---- Derived data ---------------------------------------------------------

  const searchableColumns = useMemo(
    () => columns.filter((c) => c.searchValue),
    [columns],
  );

  const sortableColumnsMap = useMemo(
    () =>
      new Map(columns.filter((c) => c.sortable).map((c) => [c.key, c.sortFn!])),
    [columns],
  );

  const filteredData = useMemo(() => {
    let result = data;

    // Full-text search
    if (search.trim() && searchableColumns.length > 0) {
      const query = search.toLowerCase().trim();
      result = result.filter((item) =>
        searchableColumns.some((col) =>
          col.searchValue!(item).toLowerCase().includes(query),
        ),
      );
    }

    // Sorting
    if (sortColumnKey && sortDirection) {
      const compareFn = sortableColumnsMap.get(sortColumnKey);
      if (compareFn) {
        result = [...result].sort((a, b) =>
          sortDirection === 'asc' ? compareFn(a, b) : compareFn(b, a),
        );
      }
    }

    return result;
  }, [
    data,
    search,
    searchableColumns,
    sortColumnKey,
    sortDirection,
    sortableColumnsMap,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));

  // Clamp page when data or pageSize changes externally
  useEffect(() => {
    setPage((p) => Math.min(p, totalPages));
  }, [totalPages]);

  const paginatedData = useMemo(() => {
    const clampedPage = Math.min(page, totalPages);
    const start = (clampedPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, page, pageSize, totalPages]);

  const {archivedCount, activeCount} = useMemo(() => {
    const archived = data.filter((item) => isArchived(item)).length;
    return {
      archivedCount: archived,
      activeCount: data.length - archived,
    };
  }, [data, isArchived]);

  // ---- Handlers -------------------------------------------------------------

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handlePageSizeChange = useCallback((value: string | null) => {
    if (!value) return;
    setPageSize(Number(value));
    setPage(1);
  }, []);

  const handleSort = useCallback(
    (columnKey: string) => {
      if (sortColumnKey === columnKey) {
        // Cycle: asc -> desc -> none
        if (sortDirection === 'asc') {
          setSortDirection('desc');
        } else if (sortDirection === 'desc') {
          setSortColumnKey(null);
          setSortDirection(null);
        } else {
          setSortDirection('asc');
        }
      } else {
        setSortColumnKey(columnKey);
        setSortDirection('asc');
      }
      setPage(1);
    },
    [sortColumnKey, sortDirection],
  );

  // ---- JSX ------------------------------------------------------------------

  return (
    <Box>
      {title && (
        <Group justify="space-between" align="flex-end" mb="md">
          <Box>
            <Title order={2}>{title}</Title>
            <Text size="sm" c="dimmed" mt={4}>
              Celkem {data.length} {noun.genitivePlural} ({activeCount}{' '}
              aktivních, {archivedCount} archivovaných)
            </Text>
          </Box>
        </Group>
      )}

      <TextInput
        id={`${id}-search`}
        placeholder={searchPlaceholder}
        leftSection={<IconSearch size={16} />}
        mb="md"
        value={search}
        onChange={(e) => handleSearchChange(e.currentTarget.value)}
      />

      {filteredData.length === 0 ? (
        <Text c="dimmed" ta="center" py="xl">
          {search.trim()
            ? (noSearchResultsMessage ??
              `Žádné výsledky neodpovídají vyhledávání.`)
            : (emptyMessage ?? `Žádná data v databázi.`)}
        </Text>
      ) : (
        <>
          <Table.ScrollContainer minWidth={700}>
            <Table striped highlightOnHover verticalSpacing="sm">
              <Table.Thead>
                <Table.Tr>
                  {columns.map((col) =>
                    col.sortable ? (
                      <Table.Th
                        key={col.key}
                        aria-sort={
                          sortColumnKey === col.key && sortDirection
                            ? sortDirection === 'asc'
                              ? 'ascending'
                              : 'descending'
                            : 'none'
                        }
                        style={{userSelect: 'none'}}>
                        <button
                          type="button"
                          onClick={() => handleSort(col.key)}
                          className={classes.sortButton}>
                          <Group gap={4} wrap="nowrap">
                            {col.header}
                            <SortIcon
                              columnKey={col.key}
                              activeColumnKey={sortColumnKey}
                              direction={sortDirection}
                            />
                          </Group>
                        </button>
                      </Table.Th>
                    ) : (
                      <Table.Th key={col.key}>{col.header}</Table.Th>
                    ),
                  )}
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {paginatedData.map((item) => {
                  const archived = isArchived(item);

                  return (
                    <Table.Tr
                      key={getRowKey(item)}
                      className={archived ? classes.archivedRow : undefined}>
                      {columns.map((col) => (
                        <Table.Td key={col.key}>{col.render(item)}</Table.Td>
                      ))}
                    </Table.Tr>
                  );
                })}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>

          <AdminTablePagination
            idPrefix={id}
            page={page}
            totalPages={totalPages}
            pageSize={pageSize}
            currentPageItemCount={paginatedData.length}
            filteredTotal={filteredData.length}
            onPageChange={setPage}
            onPageSizeChange={handlePageSizeChange}
          />
        </>
      )}
    </Box>
  );
}
