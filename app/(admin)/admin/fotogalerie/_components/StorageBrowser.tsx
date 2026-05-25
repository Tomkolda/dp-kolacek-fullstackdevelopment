'use client';

import {
  ActionIcon,
  Box,
  Button,
  Center,
  Group,
  Image,
  Loader,
  Modal,
  NavLink,
  Progress,
  ScrollArea,
  Stack,
  Text,
  Textarea,
} from '@mantine/core';
import {useDisclosure} from '@mantine/hooks';
import {notifications} from '@mantine/notifications';
import {
  IconChevronLeft,
  IconDeviceFloppy,
  IconFolder,
  IconTrash,
  IconUpload,
} from '@tabler/icons-react';
import {
  type ChangeEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  deleteGalleryFile,
  type GalleryFileMetadata,
  registerGalleryFiles,
  updatePhotoCaption,
} from '@/lib/server/registerGalleryFiles';
import {
  listStorageFiles,
  listStorageFolders,
  type StorageFile,
  type StorageFolder,
} from '@/lib/server/storageBrowser';
import {FOTOGALLERY_BUCKET} from '@/lib/utils/storage';
import {
  IMAGE_ACCEPT_STRING,
  uploadStorageImage,
} from '@/lib/utils/uploadStorageImage';

import classes from './StorageBrowser.module.css';

function getImageDimensions(
  file: File,
): Promise<{width: number; height: number} | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      resolve({width: img.naturalWidth, height: img.naturalHeight});
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      resolve(null);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  });
}

export function StorageBrowser() {
  const [folders, setFolders] = useState<StorageFolder[]>([]);
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [loadingFolders, setLoadingFolders] = useState(true);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [previewFile, setPreviewFile] = useState<StorageFile | null>(null);
  const [previewOpened, {open: openPreview, close: closePreview}] =
    useDisclosure(false);

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({done: 0, total: 0});
  const [deleting, setDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [caption, setCaption] = useState('');
  const [savingCaption, setSavingCaption] = useState(false);

  const handlePreview = useCallback(
    (file: StorageFile) => {
      setPreviewFile(file);
      setCaption(file.caption ?? '');
      openPreview();
    },
    [openPreview],
  );

  const handleClosePreview = useCallback(() => {
    closePreview();
    setPreviewFile(null);
    setCaption('');
  }, [closePreview]);

  const handleSaveCaption = useCallback(async () => {
    if (!selectedFolder || !previewFile) return;

    setSavingCaption(true);
    try {
      const result = await updatePhotoCaption(
        selectedFolder,
        previewFile.name,
        caption,
      );
      if (result.success) {
        notifications.show({
          title: 'Uloženo',
          message: 'Popisek byl uložen.',
          color: 'green',
        });
        setFiles((prev) =>
          prev.map((f) =>
            f.name === previewFile.name
              ? {...f, caption: caption.trim() || null}
              : f,
          ),
        );
        setPreviewFile((prev) =>
          prev ? {...prev, caption: caption.trim() || null} : prev,
        );
      } else {
        notifications.show({
          title: 'Chyba',
          message: result.error,
          color: 'red',
        });
      }
    } catch {
      notifications.show({
        title: 'Chyba',
        message: 'Neočekávaná chyba při ukládání popisku.',
        color: 'red',
      });
    } finally {
      setSavingCaption(false);
    }
  }, [selectedFolder, previewFile, caption]);

  const fetchFolders = useCallback(async () => {
    setLoadingFolders(true);
    try {
      const result = await listStorageFolders();
      setFolders(result);
    } finally {
      setLoadingFolders(false);
    }
  }, []);

  const fetchFiles = useCallback(async (folder: string) => {
    setLoadingFiles(true);
    try {
      const result = await listStorageFiles(folder);
      setFiles(result);
    } finally {
      setLoadingFiles(false);
    }
  }, []);

  const handleDelete = useCallback(
    async (file: StorageFile) => {
      if (!selectedFolder) return;

      setDeleting(true);
      try {
        const result = await deleteGalleryFile(selectedFolder, file.name);
        if (result.success) {
          notifications.show({
            title: 'Smazáno',
            message: `Fotka "${file.name}" byla smazána.`,
            color: 'green',
          });
          if (previewFile?.name === file.name) {
            handleClosePreview();
          }
          void fetchFiles(selectedFolder);
        } else {
          notifications.show({
            title: 'Chyba',
            message: result.error,
            color: 'red',
          });
        }
      } catch {
        notifications.show({
          title: 'Chyba',
          message: 'Neočekávaná chyba při mazání.',
          color: 'red',
        });
      } finally {
        setDeleting(false);
      }
    },
    [selectedFolder, previewFile, handleClosePreview, fetchFiles],
  );

  useEffect(() => {
    void fetchFolders();
  }, [fetchFolders]);

  useEffect(() => {
    if (selectedFolder) {
      void fetchFiles(selectedFolder);
    } else {
      setFiles([]);
    }
  }, [selectedFolder, fetchFiles]);

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFilesSelected = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = e.target.files;
      if (!selectedFiles || selectedFiles.length === 0 || !selectedFolder)
        return;

      const fileList = Array.from(selectedFiles);
      setUploading(true);
      setUploadProgress({done: 0, total: fileList.length});

      let successCount = 0;
      const uploadedMeta: GalleryFileMetadata[] = [];
      const errors: string[] = [];

      try {
        for (const file of fileList) {
          const result = await uploadStorageImage(
            FOTOGALLERY_BUCKET,
            file,
            selectedFolder,
          );
          if (result.success) {
            successCount++;
            const dims = await getImageDimensions(file);
            uploadedMeta.push({
              fileName: file.name,
              mimeType: file.type,
              sizeBytes: file.size,
              width: dims?.width ?? null,
              height: dims?.height ?? null,
            });
          } else {
            errors.push(`${file.name}: ${result.error}`);
          }
          setUploadProgress((prev) => ({...prev, done: prev.done + 1}));
        }

        if (uploadedMeta.length > 0) {
          const dbResult = await registerGalleryFiles(
            selectedFolder,
            uploadedMeta,
          );
          if (!dbResult.success) {
            errors.push(`DB: ${dbResult.error}`);
          }
        }
      } catch {
        errors.push('Neočekávaná chyba při nahrávání.');
      } finally {
        setUploading(false);
        setUploadProgress({done: 0, total: 0});

        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }

      if (successCount > 0) {
        notifications.show({
          title: 'Nahráno',
          message: `Úspěšně nahráno ${successCount} z ${fileList.length} fotek.`,
          color: 'green',
        });
        void fetchFiles(selectedFolder);
      }

      if (errors.length > 0) {
        notifications.show({
          title: 'Některé soubory se nepodařilo nahrát',
          message: errors.join('\n'),
          color: 'red',
          autoClose: 8000,
        });
      }
    },
    [selectedFolder, fetchFiles],
  );

  return (
    <Box className={classes.root}>
      {selectedFolder && (
        <Group className={classes.header} gap="xs" px="sm" py="xs">
          <ActionIcon
            variant="subtle"
            size="sm"
            onClick={() => setSelectedFolder(null)}
            aria-label="Zpět">
            <IconChevronLeft size={16} />
          </ActionIcon>
          <Text fw={500} size="sm" lineClamp={1} style={{flex: 1, minWidth: 0}}>
            {selectedFolder}
          </Text>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={IMAGE_ACCEPT_STRING}
            style={{display: 'none'}}
            onChange={handleFilesSelected}
          />
          <Button
            size="xs"
            variant="light"
            leftSection={<IconUpload size={14} />}
            onClick={handleUploadClick}
            loading={uploading}>
            Nahrát fotky
          </Button>
        </Group>
      )}

      {uploading && (
        <Box px="sm" py={6}>
          <Progress
            value={(uploadProgress.done / uploadProgress.total) * 100}
            size="sm"
            animated
          />
          <Text size="xs" c="dimmed" mt={4}>
            Nahrávání {uploadProgress.done}/{uploadProgress.total}…
          </Text>
        </Box>
      )}

      <Group className={classes.panels} align="stretch" gap={0} wrap="nowrap">
        <ScrollArea className={classes.foldersPanel}>
          {loadingFolders ? (
            <Center py="xl">
              <Loader size="sm" />
            </Center>
          ) : folders.length === 0 ? (
            <Text size="sm" c="dimmed" p="md">
              Žádné složky.
            </Text>
          ) : (
            <Stack gap={0}>
              {folders.map((folder) => (
                <NavLink
                  key={folder.name}
                  label={folder.name}
                  leftSection={<IconFolder size={16} />}
                  active={selectedFolder === folder.name}
                  onClick={() => setSelectedFolder(folder.name)}
                />
              ))}
            </Stack>
          )}
        </ScrollArea>

        <ScrollArea className={classes.filesPanel}>
          {!selectedFolder && (
            <Text size="sm" c="dimmed" p="md">
              Vyberte složku pro zobrazení fotek.
            </Text>
          )}

          {selectedFolder && loadingFiles && (
            <Center py="xl">
              <Loader size="sm" />
            </Center>
          )}

          {selectedFolder && !loadingFiles && files.length === 0 && (
            <Text size="sm" c="dimmed" p="md">
              Složka neobsahuje žádné fotky.
            </Text>
          )}

          {selectedFolder && !loadingFiles && files.length > 0 && (
            <Stack gap={0}>
              {files.map((file) => (
                <Box
                  key={file.name}
                  className={classes.fileRow}
                  onClick={() => handlePreview(file)}>
                  <Group gap="sm" wrap="nowrap" style={{flex: 1, minWidth: 0}}>
                    <Image
                      src={file.url}
                      alt={file.name}
                      w={32}
                      h={32}
                      radius="sm"
                      fit="cover"
                      style={{flexShrink: 0}}
                    />
                    <Text size="sm" lineClamp={1} style={{minWidth: 0}}>
                      {file.name}
                    </Text>
                  </Group>
                  <ActionIcon
                    variant="subtle"
                    color="red"
                    size="sm"
                    loading={deleting}
                    onClick={(e) => {
                      e.stopPropagation();
                      void handleDelete(file);
                    }}
                    aria-label="Smazat fotku">
                    <IconTrash size={16} />
                  </ActionIcon>
                </Box>
              ))}
            </Stack>
          )}
        </ScrollArea>
      </Group>

      <Modal
        opened={previewOpened}
        onClose={handleClosePreview}
        title={previewFile?.name}
        size="xl"
        centered>
        {previewFile && (
          <Stack gap="md">
            <Image
              src={previewFile.url}
              alt={previewFile.name}
              fit="contain"
              mah="60vh"
              radius="sm"
            />
            <Textarea
              label="Popisek fotky"
              placeholder="Zadejte popisek…"
              value={caption}
              onChange={(e) => setCaption(e.currentTarget.value)}
              autosize
              minRows={2}
              maxRows={5}
            />
            <Group justify="flex-end">
              <Button
                leftSection={<IconDeviceFloppy size={16} />}
                onClick={handleSaveCaption}
                loading={savingCaption}>
                Uložit popisek
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </Box>
  );
}
