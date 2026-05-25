import type {ReactNode} from 'react';

export type SortDirection = 'asc' | 'desc' | null;

type ColumnDefBase<T> = {
  /** Unique column key. */
  key: string;
  /** Header label. */
  header: string;
  /** Render the cell content for a given row. */
  render: (item: T) => ReactNode;
  /** Extract a plain-text value used for full-text search filtering. */
  searchValue?: (item: T) => string;
};

type SortableColumn<T> = ColumnDefBase<T> & {
  /** Column is sortable. */
  sortable: true;
  /** Comparison function used for sorting. */
  sortFn: (a: T, b: T) => number;
};

type NonSortableColumn<T> = ColumnDefBase<T> & {
  sortable?: false;
  sortFn?: never;
};

export type ColumnDef<T> = SortableColumn<T> | NonSortableColumn<T>;

export type AdminTableProps<T> = {
  /** Data array to display. */
  data: T[];
  /** Column definitions. */
  columns: Array<ColumnDef<T>>;
  /** Page title shown above the table. When omitted, no title/summary is rendered. */
  title?: string;
  /** Placeholder for the search input. */
  searchPlaceholder?: string;
  /** Default sort configuration. */
  defaultSort?: {
    columnKey: string;
    direction: 'asc' | 'desc';
  };
  /** Default number of rows per page (default 20). */
  defaultPageSize?: number;
  /** Return a unique key for each row. */
  getRowKey: (item: T) => string | number;
  /** Determine whether a row is archived. Defaults to checking `archivedAt`. */
  isArchived?: (item: T) => boolean;
  /** Czech noun forms used in summary text. */
  noun: {
    /** Genitive plural, e.g. "koncertů". */
    genitivePlural: string;
  };
  /** Message shown when the data array is empty. */
  emptyMessage?: string;
  /** Message shown when search yields no results. */
  noSearchResultsMessage?: string;
};
