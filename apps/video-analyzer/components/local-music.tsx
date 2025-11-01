'use client';

import React from 'react';
import { useSystemContext } from '@/state/system-reducer';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import TranslucentPaper from '@repo/ui/translucent-paper';
import { BackgroundMusicType } from '@/state/background-music-type';
import Divisor from '@repo/ui/divisor';
import SSRPlayer from '@/components/ssr-player';
import useBackgroundMusic from '@/state/use-background-music';
import HorizontalDivisor from '@repo/ui/horizontal-divisor';
import IconButton from '@mui/material/IconButton';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ButtonToCopy from '@repo/ui/button-to-copy';
import DeleteIcon from '@mui/icons-material/Delete';
import { Typography } from '@mui/material';
import GetDomainURLFromEnv from '@repo/helpers/get-domain-url';

const domainURL = GetDomainURLFromEnv();

const LocalBackgroundMusic = () => {
  const { state } = useSystemContext();
  const ProcessMusic = useBackgroundMusic();

  if (!state.backgroundMusic.length) {
    return null;
  }

  return (
    <>
      <Divisor />
      <Divisor />
      <Grid spacing={2} container>
        {state.backgroundMusic.map((i: BackgroundMusicType, index: number) => {
          const complete = ProcessMusic.RequestCompleted(
            i.attributes.local_link
          );
          return (
            <Grid key={index} size={{ xs: 6, sm: 4, md: 3, lg: 2 }}>
              <TranslucentPaper>
                {i.attributes.thumbnail ? (
                  <Box
                    width="100%"
                    height={250}
                    sx={{
                      backgroundImage: `url(${domainURL}/${i.attributes.thumbnail})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  />
                ) : null}
                <SSRPlayer
                  link={i.attributes.local_link}
                  height={55}
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
                      onClick={() => ProcessMusic.DeleteMusicByID(i.id)}
                      color="error"
                      style={{
                        width: 35,
                        height: 35,
                        boxShadow: '0px 0px 5px rgba(13, 13, 13, 0.24)',
                      }}
                      disabled={ProcessMusic.isLoading || !complete}
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

export default LocalBackgroundMusic;
