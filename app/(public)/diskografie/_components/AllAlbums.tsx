import {
  Container,
  Grid,
  GridCol,
  Paper,
  Stack,
  Text,
  Title,
} from '@mantine/core';

import {getAlbumDetailAction, getAlbums} from '@/lib/server/getAlbums';

import {AlbumView} from './AlbumView';
import classes from './AllAlbums.module.css';

/** Fetches and displays all albums on the dedicated discography page. */
export async function AllAlbums() {
  const allAlbums = await getAlbums();

  return (
    <section id="discography">
      <Container py="xl" size="xl" className={classes.pageShell}>
        <Stack align="center" gap="sm" mb="xl">
          <Title order={1} ta="center" className={classes.heading}>
            Diskografie
          </Title>
        </Stack>

        {allAlbums.length === 0 ? (
          <Paper withBorder radius="xl" p="xl" className={classes.emptyState}>
            <Text c="dimmed" ta="center">
              Zatím zde nejsou žádná alba.
            </Text>
          </Paper>
        ) : (
          <Grid gutter="md">
            {allAlbums.map((album) => (
              <GridCol key={album.id} span={{base: 12, sm: 6, md: 4}}>
                <AlbumView
                  album={album}
                  getAlbumDetailAction={getAlbumDetailAction}
                />
              </GridCol>
            ))}
          </Grid>
        )}
      </Container>
    </section>
  );
}
