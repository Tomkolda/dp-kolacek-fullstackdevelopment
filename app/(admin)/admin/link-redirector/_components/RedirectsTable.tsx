'use client';

import {
  ActionIcon,
  Anchor,
  Box,
  Button,
  Group,
  Text,
  Title,
  Tooltip,
} from '@mantine/core';
import {useDisclosure} from '@mantine/hooks';
import {notifications} from '@mantine/notifications';
import {
  IconArchive,
  IconArchiveOff,
  IconEdit,
  IconPlus,
} from '@tabler/icons-react';
import {useRouter} from 'next/navigation';
import {useCallback, useMemo, useState} from 'react';

import adminModalClasses from '@/components/shared/AdminModal/Modal.module.css';
import {AdminTable, type ColumnDef} from '@/components/shared/AdminTable';
import type {DBRedirect} from '@/db/types';
import {toggleArchive} from '@/lib/server/toggleArchive';
import {isHttpUrl} from '@/lib/utils/url';

import {CreateRedirectModal} from './CreateRedirectModal';
import {EditRedirectModal} from './EditRedirectModal';

function formatPath(path: string): string {
  return path.startsWith('/') ? path : `/${path}`;
}

const columns: Array<ColumnDef<DBRedirect>> = [
  {
    key: 'title',
    header: 'Název',
    render: (redirect) => (
      <Text fw={500} lineClamp={1}>
        {redirect.title}
      </Text>
    ),
    sortable: true,
    sortFn: (a, b) => a.title.localeCompare(b.title, 'cs'),
    searchValue: (redirect) => redirect.title,
  },
  {
    key: 'path',
    header: 'Cesta',
    render: (redirect) => (
      <Text ff="monospace" size="sm">
        {formatPath(redirect.path)}
      </Text>
    ),
    searchValue: (redirect) => formatPath(redirect.path),
  },
  {
    key: 'target',
    header: 'Cíl',
    render: (redirect) => {
      const target = isHttpUrl(redirect.target) ? redirect.target : null;

      if (!target) {
        return (
          <Text size="sm" c="dimmed">
            {redirect.target}
          </Text>
        );
      }

      return (
        <Anchor
          href={target}
          target="_blank"
          rel="noopener noreferrer"
          lineClamp={1}>
          {target}
        </Anchor>
      );
    },
    searchValue: (redirect) => redirect.target,
  },
];

function makeActionsColumn(
  onEdit: (redirect: DBRedirect) => void,
  onToggleArchive: (redirect: DBRedirect) => void,
  pendingId: number | null,
): ColumnDef<DBRedirect> {
  return {
    key: 'actions',
    header: 'Akce',
    render: (redirect) => (
      <Group gap="xs" wrap="nowrap">
        <Tooltip label="Upravit">
          <ActionIcon
            variant="subtle"
            color="blue"
            size="sm"
            aria-label="Upravit"
            disabled={pendingId !== null}
            onClick={() => onEdit(redirect)}>
            <IconEdit size={16} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label={redirect.archivedAt ? 'Odarchivovat' : 'Archivovat'}>
          <ActionIcon
            variant="subtle"
            color={redirect.archivedAt ? 'green' : 'red'}
            size="sm"
            aria-label={redirect.archivedAt ? 'Odarchivovat' : 'Archivovat'}
            loading={pendingId === redirect.id}
            disabled={pendingId !== null && pendingId !== redirect.id}
            onClick={() => onToggleArchive(redirect)}>
            {redirect.archivedAt ? (
              <IconArchiveOff size={16} />
            ) : (
              <IconArchive size={16} />
            )}
          </ActionIcon>
        </Tooltip>
      </Group>
    ),
  };
}

type RedirectsTableProps = {
  redirects: DBRedirect[];
};

const sharedTableProps = {
  searchPlaceholder: 'Hledat podle cesty, názvu nebo cíle...',
  getRowKey: (redirect: DBRedirect) => redirect.id,
  noun: {genitivePlural: 'redirectů'} as const,
  noSearchResultsMessage: 'Žádné redirecty neodpovídají vyhledávání.',
};

export function RedirectsTable({redirects}: RedirectsTableProps) {
  const router = useRouter();
  const [createOpened, {open: openCreateModal, close: closeCreateModal}] =
    useDisclosure(false);
  const [editOpened, {open: openEditModal, close: closeEditModal}] =
    useDisclosure(false);
  const [editingRedirect, setEditingRedirect] = useState<DBRedirect | null>(
    null,
  );
  const [pendingId, setPendingId] = useState<number | null>(null);

  const onEdit = useCallback(
    (redirect: DBRedirect) => {
      setEditingRedirect(redirect);
      openEditModal();
    },
    [openEditModal],
  );

  const onCloseEditModal = useCallback(() => {
    closeEditModal();
    setEditingRedirect(null);
  }, [closeEditModal]);

  const onToggleArchive = useCallback(
    (redirect: DBRedirect) => {
      const archive = !redirect.archivedAt;
      setPendingId(redirect.id);
      void (async () => {
        try {
          const result = await toggleArchive(
            'linkRedirector',
            redirect.id,
            archive,
          );

          if (result.success) {
            router.refresh();
            return;
          }

          notifications.show({
            title: 'Chyba',
            message:
              result.error ?? 'Archivaci redirectu se nepodařilo dokončit.',
            color: 'red',
          });
        } catch {
          notifications.show({
            title: 'Chyba',
            message: 'Archivaci redirectu se nepodařilo dokončit.',
            color: 'red',
          });
        } finally {
          setPendingId(null);
        }
      })();
    },
    [router],
  );

  const actionsColumn = useMemo(
    () => makeActionsColumn(onEdit, onToggleArchive, pendingId),
    [onEdit, onToggleArchive, pendingId],
  );

  const allColumns = useMemo(
    () => [...columns, actionsColumn],
    [actionsColumn],
  );

  return (
    <Box>
      <Group justify="space-between" align="center" mb="md">
        <Title order={2}>Link Redirector</Title>
        <Button
          className={adminModalClasses.submitButton}
          leftSection={<IconPlus size={16} />}
          onClick={openCreateModal}>
          Přidat redirect
        </Button>
      </Group>

      <AdminTable
        {...sharedTableProps}
        data={redirects}
        columns={allColumns}
        emptyMessage="Žádné redirecty."
      />

      <CreateRedirectModal
        opened={createOpened}
        onCloseAction={closeCreateModal}
      />
      <EditRedirectModal
        opened={editOpened}
        redirect={editingRedirect}
        onCloseAction={onCloseEditModal}
      />
    </Box>
  );
}
