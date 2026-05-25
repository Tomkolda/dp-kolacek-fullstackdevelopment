import {Anchor, AspectRatio, Box, Text, Title} from '@mantine/core';

import {getWebItemByKey} from '@/lib/server/getWebItem';
import {toYoutubeEmbedUrl} from '@/lib/utils/youtube';

export async function Videoclip() {
  const videoPreview = await getWebItemByKey('video_preview');
  const videoUrl = toYoutubeEmbedUrl(videoPreview?.videoUrl);
  if (!videoUrl) return null;

  return (
    <section id="videoclip">
      <Box>
        <Title order={2} ta="center" mb="md">
          Videoklip
        </Title>
        <Text fz="lg" ta="center" mb="md">
          Navštivte náš{' '}
          <Anchor href="/youtube" td="none">
            YouTube kanál
          </Anchor>
          .
        </Text>

        <AspectRatio ratio={16 / 9} mx="auto" maw={960}>
          <iframe
            src={videoUrl}
            title={videoPreview?.title ?? 'Videoklip'}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </AspectRatio>
      </Box>
    </section>
  );
}
