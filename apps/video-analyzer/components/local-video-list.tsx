/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useEffect, useState } from 'react';
import { GetLocalStorageData } from '@repo/helpers/local-storage';
import { VideoType } from '@/state/video-type';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import VideoName from '@/components/video-name';
import VideoLink from '@/components/video-link';
import GetDomainURLFromEnv from '@repo/helpers/get-domain-url';
import DeleteVideoButton from '@/components/delete-video-button';
import Link from 'next/link';
import ShareButton from '@repo/ui/share-button';
import TranslucentPaper from '@repo/ui/translucent-paper';
import HorizontalDivisor from '@repo/ui/horizontal-divisor';

const LocalVideoList = () => {
  const domainURL = GetDomainURLFromEnv();
  const [videos, setVideos] = useState<Array<VideoType>>([]);

  useEffect(() => {
    const data: Array<VideoType> = JSON.parse(
      GetLocalStorageData('videos') ?? '[]'
    );
    setVideos(data);
  }, []);

  return (
    <Grid spacing={2} container>
      {videos
        .sort((a, b) => Number(b.id) - Number(a.id))
        .map((i: VideoType, index: number) => {
          return (
            <Grid key={index} size={{ xs: 12 }}>
              <TranslucentPaper>
                <Box display="flex" padding={1}>
                  {i.attributes.thumbnail ? (
                    <>
                      <Link
                        href={`/videos/${i.attributes.uuid ?? 'invalid-id'}/`}
                      >
                        <img
                          src={`${domainURL}/${i.attributes.thumbnail
                            .replaceAll('/app/media/', 'media/')
                            .replaceAll('/media/', 'media/')
                            .replaceAll('public', '')}`}
                          alt={i.attributes.name}
                          width={90}
                          height="auto"
                          style={{
                            borderRadius: 3,
                          }}
                        />
                      </Link>
                      <Box width={10} flexShrink={0} />
                    </>
                  ) : null}

                  <Box display="flex" flexDirection="column" alignItems={'end'}>
                    <Box display="flex" flexDirection="column">
                      {i.attributes.name ? (
                        <>
                          <VideoName
                            name={i.attributes.name}
                            href={`/videos/${i.attributes.uuid ?? 'invalid-id'}/`}
                          />
                          <HorizontalDivisor margin={1} />
                        </>
                      ) : null}
                      <VideoLink
                        link={i.attributes.link}
                        href={`/videos/${i.attributes.uuid ?? 'invalid-id'}/`}
                      />
                    </Box>
                    <HorizontalDivisor margin={1} />
                    <Box display="flex">
                      <DeleteVideoButton
                        id={i.id}
                        callback={(data) => setVideos(data)}
                      />
                      <Box width={10} flexShrink={0} />
                      <ShareButton
                        size="small"
                        color="success"
                        title={i.attributes.name}
                        text={i.attributes.name}
                        url={`${domainURL}/videos/${i.attributes.uuid ?? 'invalid-id'}/`}
                      />
                    </Box>
                  </Box>
                </Box>
              </TranslucentPaper>
            </Grid>
          );
        })}
    </Grid>
  );
};

export default LocalVideoList;
