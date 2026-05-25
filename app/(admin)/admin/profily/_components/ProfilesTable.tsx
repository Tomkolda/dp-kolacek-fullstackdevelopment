'use client';

import {
  ActionIcon,
  Box,
  Button,
  ColorSwatch,
  Group,
  Image,
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
import type {AdminProfile} from '@/lib/server/getProfilesAdmin';
import {toggleArchive} from '@/lib/server/toggleArchive';

import {CreateProfileModal} from './CreateProfileModal';
import {EditProfileModal} from './EditProfileModal';

type ProfilesTableProps = {
  profiles: AdminProfile[];
};

const columns: Array<ColumnDef<AdminProfile>> = [
  {
    key: 'name',
    header: 'Název',
    render: (profile) => <Text fw={500}>{profile.name}</Text>,
    sortable: true,
    sortFn: (a, b) => a.name.localeCompare(b.name, 'cs'),
    searchValue: (profile) => profile.name,
  },
  {
    key: 'icon',
    header: 'Ikona',
    render: (profile) => (
      <Image
        src={profile.iconUrl}
        alt={profile.name}
        h={32}
        w={32}
        fit="contain"
        radius="sm"
      />
    ),
    searchValue: (profile) => profile.icon,
  },
  {
    key: 'link',
    header: 'Link',
    render: (profile) => (
      <Text size="sm" ff="monospace" lineClamp={1}>
        {profile.link}
      </Text>
    ),
    searchValue: (profile) => profile.link,
  },
  {
    key: 'iconColor',
    header: 'Barva ikony',
    render: (profile) => (
      <Group gap="sm" wrap="nowrap">
        <ColorSwatch color={profile.iconColor || 'gray'} size={20} />
        <Text size="sm" c={profile.iconColor ? undefined : 'dimmed'}>
          {profile.iconColor ?? '—'}
        </Text>
      </Group>
    ),
    searchValue: (profile) => profile.iconColor ?? '',
  },
];

function makeActionsColumn(
  onEdit: (profile: AdminProfile) => void,
  onToggleArchive: (profile: AdminProfile) => void,
  pendingId: number | null,
): ColumnDef<AdminProfile> {
  return {
    key: 'actions',
    header: 'Akce',
    render: (profile) => (
      <Group gap="xs" wrap="nowrap">
        <Tooltip label="Upravit">
          <ActionIcon
            variant="subtle"
            color="blue"
            size="sm"
            aria-label="Upravit"
            disabled={pendingId !== null}
            onClick={() => onEdit(profile)}>
            <IconEdit size={16} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label={profile.archivedAt ? 'Odarchivovat' : 'Archivovat'}>
          <ActionIcon
            variant="subtle"
            color={profile.archivedAt ? 'green' : 'red'}
            size="sm"
            aria-label={profile.archivedAt ? 'Odarchivovat' : 'Archivovat'}
            loading={pendingId === profile.id}
            disabled={pendingId !== null && pendingId !== profile.id}
            onClick={() => onToggleArchive(profile)}>
            {profile.archivedAt ? (
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

export function ProfilesTable({profiles}: ProfilesTableProps) {
  const router = useRouter();
  const [createModalOpened, {open: openCreateModal, close: closeCreateModal}] =
    useDisclosure(false);
  const [editModalOpened, {open: openEditModal, close: closeEditModal}] =
    useDisclosure(false);
  const [editingProfile, setEditingProfile] = useState<AdminProfile | null>(
    null,
  );
  const [pendingId, setPendingId] = useState<number | null>(null);

  const onEdit = useCallback(
    (profile: AdminProfile) => {
      setEditingProfile(profile);
      openEditModal();
    },
    [openEditModal],
  );

  const onCloseEditModal = useCallback(() => {
    closeEditModal();
    setEditingProfile(null);
  }, [closeEditModal]);

  const onToggleArchive = useCallback(
    (profile: AdminProfile) => {
      const archive = !profile.archivedAt;
      setPendingId(profile.id);
      void (async () => {
        try {
          const result = await toggleArchive('profiles', profile.id, archive);
          if (result.success) {
            router.refresh();
            return;
          }

          notifications.show({
            title: 'Chyba',
            message:
              result.error ?? 'Archivaci profilu se nepodařilo dokončit.',
            color: 'red',
          });
        } catch {
          notifications.show({
            title: 'Chyba',
            message: 'Archivaci profilu se nepodařilo dokončit.',
            color: 'red',
          });
        } finally {
          setPendingId(null);
        }
      })();
    },
    [router],
  );

  const allColumns = useMemo(
    () => [...columns, makeActionsColumn(onEdit, onToggleArchive, pendingId)],
    [onEdit, onToggleArchive, pendingId],
  );

  return (
    <Box>
      <Group justify="space-between" align="center" mb="md">
        <Title order={2}>Sociální sítě a profily</Title>
        <Button
          className={adminModalClasses.submitButton}
          leftSection={<IconPlus size={16} />}
          onClick={openCreateModal}>
          Přidat profil
        </Button>
      </Group>

      <CreateProfileModal
        opened={createModalOpened}
        onCloseAction={closeCreateModal}
      />
      <EditProfileModal
        opened={editModalOpened}
        profile={editingProfile}
        onCloseAction={onCloseEditModal}
      />

      <AdminTable
        data={profiles}
        columns={allColumns}
        searchPlaceholder="Hledat podle názvu nebo linku..."
        defaultSort={{columnKey: 'name', direction: 'asc'}}
        getRowKey={(profile) => profile.id}
        noun={{genitivePlural: 'profilů'}}
        emptyMessage="Žádné profily v databázi."
        noSearchResultsMessage="Žádné profily neodpovídají vyhledávání."
      />
    </Box>
  );
}
