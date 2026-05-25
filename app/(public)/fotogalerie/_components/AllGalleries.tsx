import {
  Container,
  Grid,
  GridCol,
  Paper,
  Stack,
  Text,
  Title,
} from '@mantine/core';

import {getGalleries, getGalleryPhotos} from '@/lib/server/getGalleries';

import classes from './AllGalleries.module.css';
import {GalleryView} from './GalleryView';

type AllGalleriesProps = {
  openSlug?: string;
};

/** Fetches and displays all photo galleries on the dedicated page. */
export async function AllGalleries({openSlug}: AllGalleriesProps) {
  const allGalleries = await getGalleries();

  return (
    <section>
      <Container py="xl" size="xl" className={classes.pageShell}>
        <Stack align="center" gap="sm" mb="xl">
          <Title order={1} ta="center" className={classes.heading}>
            Fotogalerie
          </Title>
        </Stack>

        {allGalleries.length === 0 ? (
          <Paper withBorder radius="xl" p="xl" className={classes.emptyState}>
            <Text c="dimmed" ta="center">
              Zatím zde nejsou žádná fotoalba.
            </Text>
          </Paper>
        ) : (
          <Grid gutter="md">
            {allGalleries.map((gallery) => (
              <GridCol key={gallery.id} span={{base: 12, sm: 6, md: 4}}>
                <GalleryView
                  gallery={gallery}
                  getGalleryPhotosAction={getGalleryPhotos}
                  defaultOpen={gallery.slug === openSlug}
                />
              </GridCol>
            ))}
          </Grid>
        )}
      </Container>
    </section>
  );
}
