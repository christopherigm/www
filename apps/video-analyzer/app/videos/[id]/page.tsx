import React from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Container from '@mui/material/Container';
import VideoName from '@/components/video-name';
import VideoInitializer from '@/state/video-initializer';
import Player from '@/components/player';
import Divisor from '@repo/ui/divisor';
import Get from '@repo/helpers/api-get';
import APIGetBaseURLFromEnv from '@repo/helpers/api-get-base-url';
import { VideoType } from '@/state/video-type';
import DeleteVideoButton from '@/components/delete-video-button';
import Background from '@/components/background';
import TranslucentPaper from '@repo/ui/translucent-paper';
import VideoActions from '@/components/video-actions';
import VideoProcessingText from '@/components/video-processing-text';
import ShareButton from '@repo/ui/share-button';
import GetDomainURLFromEnv from '@repo/helpers/get-domain-url';
import type { Metadata } from 'next';
import InteractionsSelector from '@/components/interactions-selector';

type Props = {
  params: Promise<{ id: number }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const BaseURL = APIGetBaseURLFromEnv();
  const domainURL = GetDomainURLFromEnv();
  let url = `${BaseURL}/v1/videos/?filter[uuid]=${id}`;
  url += '&fields[Video]=name,uuid,thumbnail';
  const results: Array<VideoType> = await Get(url, true);
  if (!results) {
    return {};
  }
  let video: VideoType | null = null;
  if (results.length) {
    video = results[0];
  }
  if (!video) {
    return {};
  }
  return {
    title: `Video Analyzer - ${video.attributes.name}`,
    description: video.attributes.name,
    applicationName: 'Video Analyzer',
    alternates: {
      canonical: `${domainURL}/videos/${video.attributes.uuid ?? 'invalid-id'}/`,
    },
    openGraph: {
      images: [`${domainURL}/${video.attributes.thumbnail}`],
    },
  };
}

const Page = async ({ params }: Props) => {
  const { id } = await params;
  const BaseURL = APIGetBaseURLFromEnv();
  const domainURL = GetDomainURLFromEnv();
  const url = `${BaseURL}/v1/videos/?filter[uuid]=${id}&include=analysis`;
  const results: Array<VideoType> = await Get(url, true);
  if (!results) {
    return <>No video :c</>;
  }
  let video: VideoType | null = null;
  if (results.length) {
    video = results[0];
  }
  if (!video) {
    return <>No video :c</>;
  }

  return (
    <>
      <Background />
      <VideoInitializer ssr_video={video} />
      <Divisor />
      <Container>
        <Grid container spacing={2}>
          <Grid
            size={{ xs: 12, sm: 6, md: 5 }}
            paddingBottom={{
              xs: 0,
              sm: 2,
            }}
          >
            <Player />
            <TranslucentPaper borderRadius="0 0 5px 5px">
              <Box padding={1}>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <VideoName name={video.attributes.name} />
                  <Box width={10} flexShrink={0} />
                  <Box display="flex">
                    <DeleteVideoButton id={video.id} routeToNextVideo />
                    <Box width={10} flexShrink={0} />
                    <ShareButton
                      size="small"
                      color="success"
                      title={video.attributes.name}
                      text={video.attributes.name}
                      url={`${domainURL}/videos/${video.attributes.uuid ?? 'invalid-id'}/`}
                    />
                  </Box>
                </Box>
                <VideoProcessingText />
                <VideoActions />
              </Box>
            </TranslucentPaper>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 7 }}>
            <InteractionsSelector />
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default Page;
