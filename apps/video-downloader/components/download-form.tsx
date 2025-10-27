/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import LinearProgress from '@mui/material/LinearProgress';
import { Signal, signal } from '@preact-signals/safe-react';
import { FormEvent, useEffect, useRef, useState } from 'react';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Download from '@mui/icons-material/Download';
import type { APIPostCreationError } from '@repo/interfaces/api-error-handler';
import isTidal from '@repo/helpers/is-tidal-checker';
import isTiktok from '@repo/helpers/is-tiktok-checker';
import isYoutube from '@repo/helpers/is-youtube-checker';
import { cleanURL, isURLClean } from '@repo/helpers/clean-url';
import isIOSBrowser from '@repo/helpers/is-ios-browser-check';
import Tooltip from '@mui/material/Tooltip';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import { system } from '@/classes/system';
import Paper from '@mui/material/Paper';

const isLoading: Signal<boolean> = signal(false);
const error: Signal<Array<APIPostCreationError>> = signal([]);
const link = signal<string>('');
const downloadJustAudio: Signal<boolean> = signal(false);
const downloadHDTikTok: Signal<boolean> = signal(false);
const downloadFPS60: Signal<boolean> = signal(false);
const autoDownload: Signal<boolean> = signal(true);
const userFolder = signal<string>('');

const h264VideoInfo =
  'HD TikTok video feature, videos are more compatible to share and with higher quality. If enabled, download will take longer to complete.';

const FPS60 =
  '60 FPS video feature, videos play smoother. If enabled, download will take longer to complete.';

const DownloadForm = (props: any) => {
  system.value.setDataFromPlainObject(props);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isIOS, setisIOS] = useState<boolean>(true);

  useEffect(() => {
    const isOS = isIOSBrowser();
    setisIOS(isOS);
    autoDownload.value = !isOS;
  }, [props]);

  const canSubmit = (): boolean => {
    return link.value !== '';
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (inputRef && inputRef.current) {
      inputRef.current.getElementsByTagName('input')[0]?.blur();
    }
    system.value.addItem(link.value, {
      ...(isYoutube(link.value) && {
        justAudio: downloadJustAudio.value,
      }),
      ...(isTiktok(link.value) && {
        hdTikTok: downloadHDTikTok.value,
      }),
      ...(isTidal(link.value) &&
        userFolder.value && {
          userFolder: userFolder.value,
        }),
      FPS60: downloadFPS60.value,
      autoDownload: autoDownload.value,
    });
    link.value = '';
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      component="form"
      noValidate={false}
      autoComplete="on"
      onSubmit={handleSubmit}
      marginTop={3}
      marginBottom={3}
    >
      <Paper>
        <Grid
          container
          columnSpacing={1}
          rowSpacing={2}
          maxWidth={400}
          padding={2}
        >
          <Grid size={12}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Box width="100%">
                <TextField
                  ref={inputRef}
                  label="Link"
                  variant="outlined"
                  size="small"
                  type="url"
                  name="url"
                  autoComplete="none"
                  autoSave="none"
                  value={link.value}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    (link.value = e.target.value)
                  }
                  disabled={isLoading.value}
                  style={{ width: '100%' }}
                />
                {isTidal(link.value) ? (
                  <Box width="100%" marginTop={1.5}>
                    <TextField
                      label="Folder"
                      variant="outlined"
                      size="small"
                      type="text"
                      autoComplete="none"
                      autoSave="none"
                      value={userFolder.value}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        (userFolder.value = e.target.value)
                      }
                      disabled={isLoading.value}
                      style={{ width: '100%' }}
                    />
                  </Box>
                ) : null}
              </Box>
              {link.value && !isURLClean(link.value) ? (
                <Box marginLeft={2} display="flex">
                  <IconButton
                    aria-label="clean"
                    size="small"
                    color="default"
                    disabled={isLoading.value || !canSubmit()}
                    onClick={() => {
                      link.value = cleanURL(link.value);
                    }}
                  >
                    <CleaningServicesIcon fontSize="medium" />
                  </IconButton>
                </Box>
              ) : null}
              {link.value && isURLClean(link.value) ? (
                <Box marginLeft={2} display="flex">
                  <IconButton
                    aria-label="download"
                    size="small"
                    type="submit"
                    color="default"
                    disabled={isLoading.value || !canSubmit()}
                  >
                    <Download fontSize="medium" />
                  </IconButton>
                </Box>
              ) : null}
            </Box>
          </Grid>

          <Grid
            size={12}
            display="flex"
            justifyContent="end"
            justifyItems="center"
            flexWrap="wrap"
          >
            {!isTidal(link.value) && !isIOS ? (
              <Box width={175}>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={autoDownload.value}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          (autoDownload.value = e.target.checked)
                        }
                      />
                    }
                    label="Auto download"
                    labelPlacement="start"
                    disabled={isLoading.value}
                  />
                </FormGroup>
              </Box>
            ) : null}
            {link.value && !isTidal(link.value) ? (
              <Box width={170}>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={downloadFPS60.value}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          (downloadFPS60.value = e.target.checked)
                        }
                      />
                    }
                    label="60 FPS Video"
                    labelPlacement="start"
                    disabled={isLoading.value}
                  />
                </FormGroup>
              </Box>
            ) : null}
            {link.value && isTiktok(link.value) ? (
              <Box width={145}>
                <Tooltip title={h264VideoInfo}>
                  <FormGroup>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={downloadHDTikTok.value}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            (downloadHDTikTok.value = e.target.checked)
                          }
                        />
                      }
                      label="HD TikTok"
                      labelPlacement="start"
                      disabled={isLoading.value}
                    />
                  </FormGroup>
                </Tooltip>
              </Box>
            ) : null}
            {link.value && isYoutube(link.value) ? (
              <Box width={140} marginLeft={1}>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={downloadJustAudio.value}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          (downloadJustAudio.value = e.target.checked)
                        }
                      />
                    }
                    label="Just audio"
                    labelPlacement="start"
                    disabled={isLoading.value}
                  />
                </FormGroup>
              </Box>
            ) : null}
          </Grid>

          {link.value && downloadHDTikTok.value ? (
            <Grid size={12}>
              <Alert severity="info">{h264VideoInfo}</Alert>
            </Grid>
          ) : null}

          {link.value && downloadFPS60.value ? (
            <Grid size={12}>
              <Alert severity="info">{FPS60}</Alert>
            </Grid>
          ) : null}

          {error &&
          error.value &&
          error.value.length &&
          error.value[0] &&
          Number(error.value[0].status) === 401 &&
          error.value[0].code === 'no_active_account' ? (
            <Grid size={12} marginTop={2}>
              <Stack sx={{ width: '100%' }} spacing={2}>
                <Alert severity="error">Error</Alert>
              </Stack>
            </Grid>
          ) : null}
          {isLoading.value ? (
            <Grid size={12} marginTop={1}>
              <Box sx={{ width: '100%' }}>
                <LinearProgress />
              </Box>
            </Grid>
          ) : null}
        </Grid>
      </Paper>
    </Box>
  );
};

export default DownloadForm;
