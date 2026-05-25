import {Anchor, Box, SimpleGrid, Text, Title} from '@mantine/core';

import {getFbNewsPosts} from '@/lib/server/getFbNewsPosts';
import {getWebItemByKey} from '@/lib/server/getWebItem';

import classes from './FbNews.module.css';
import {PostCard} from './FbPostCard';

export async function FbNews() {
  const fbNews = await getWebItemByKey('fb_news');
  if (!fbNews?.visible) return null;

  const pageId = process.env.FB_PAGE_ID;
  if (!pageId) return null;

  const posts = await getFbNewsPosts(fbNews.limit);
  if (posts.length === 0) return null;

  return (
    <section id="news" className={classes.section}>
      <Box>
        <Title order={2} ta="center" mb="md">
          Novinky
        </Title>
        <Text fz="lg" ta="center" mb="md">
          Sledujte nás na{' '}
          <Anchor
            href={`https://www.facebook.com/${pageId}`}
            target="_blank"
            rel="noopener noreferrer"
            td="none">
            Facebooku
          </Anchor>
          .
        </Text>

        <SimpleGrid cols={{base: 1, sm: 2}} spacing="lg" maw={960} mx="auto">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </SimpleGrid>
      </Box>
    </section>
  );
}
