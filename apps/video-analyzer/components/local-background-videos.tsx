'use client';

import React from 'react';
import { useSystemContext } from '@/state/system-reducer';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import TranslucentPaper from '@repo/ui/translucent-paper';
import { BackgroundVideoType } from '@/state/background-video-type';
import Divisor from '@repo/ui/divisor';
import SSRPlayer from '@/components/ssr-player';
import useBackgroundVideo from '@/state/use-background-video';
import HorizontalDivisor from '@repo/ui/horizontal-divisor';
import IconButton from '@mui/material/IconButton';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ButtonToCopy from '@repo/ui/button-to-copy';
import DeleteIcon from '@mui/icons-material/Delete';
import { Typography } from '@mui/material';

const LocalBackgroundVideos = () => {
  const { state } = useSystemContext();
  const ProcessBackgroundVideo = useBackgroundVideo();

  if (!state.backgroundVideos.length) {
    return null;
  }

  return (
    <>
      <Divisor />
      <Divisor />
      <Grid spacing={2} container>
        {state.backgroundVideos.map((i: BackgroundVideoType, index: number) => {
          const complete = ProcessBackgroundVideo.isCompleted(
            i.attributes.local_link
          );
          // if (!ProcessBackground.RequestCompleted(i.attributes.local_link)) {
          //   return null;
          // }
          return (
            <Grid key={index} size={{ xs: 6, sm: 4, md: 3, lg: 2 }}>
              <TranslucentPaper>
                <SSRPlayer
                  link={i.attributes.local_link}
                  height={'100%'}
                  playing={false}
                />
                <Box padding={1}>
                  {!complete ? 'Is loading...' : ''}
                  {i.attributes.name ? (
                    <>
                      <Typography fontWeight="bold" noWrap>
                        {i.attributes.name}
                      </Typography>
                      <HorizontalDivisor margin={1} />
                    </>
                  ) : null}
                  {i.attributes.author ? (
                    <>
                      <Typography noWrap>By {i.attributes.author}</Typography>
                      <HorizontalDivisor margin={1} />
                    </>
                  ) : null}
                  <Box display="flex" justifyContent="space-evenly">
                    <IconButton
                      aria-label="delete"
                      size="small"
                      onClick={() => ProcessBackgroundVideo.DeleteByID(i.id)}
                      color="error"
                      style={{
                        width: 35,
                        height: 35,
                        boxShadow: '0px 0px 5px rgba(13, 13, 13, 0.24)',
                      }}
                      disabled={ProcessBackgroundVideo.isLoading || !complete}
                    >
                      <DeleteIcon fontSize={'small'} />
                    </IconButton>
                    <IconButton
                      aria-label="expand"
                      size="small"
                      color="success"
                      href={i.attributes.link}
                      target="_blank"
                      style={{
                        width: 35,
                        height: 35,
                        boxShadow: '0px 0px 5px rgba(13, 13, 13, 0.24)',
                      }}
                    >
                      <OpenInNewIcon fontSize="small" />
                    </IconButton>
                    <ButtonToCopy text={i.attributes.link} />
                  </Box>
                </Box>
              </TranslucentPaper>
            </Grid>
          );
        })}
      </Grid>
    </>
  );
};

export default LocalBackgroundVideos;
