'use client';

import { useEffect, useState } from 'react';
import { YouTubePayload } from '@repo/helpers/video-details-from-url';
import API from '@repo/helpers/api/index';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import isYoutube from '@repo/helpers/is-youtube-checker';
import isFacebook from '@repo/helpers/is-facebook-checker';
import isTiktok from '@repo/helpers/is-tiktok-checker';
import isInstagram from '@repo/helpers/is-instagram-checker';

const UseVideoDetails = (link: string) => {
  const [youTubePayload, setData] = useState<YouTubePayload | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [automaticCaptions, setAutomaticCaptions] = useState<Array<string>>([]);
  const [subtitles, setSubtitles] = useState<Array<string>>([]);
  const [captionSelected, setCaptionSelected] = useState<string | null>('auto');
  const [subtitleSelected, setSubtitleSelected] = useState<string | null>(
    'auto'
  );
  const [title, setTitle] = useState<string | null>(null);
  const [thumbnail, setThumbnail] = useState<string | null>(null);

  const updateAutomaticCaptions = (data: YouTubePayload) => {
    const keys = Object.keys(data.automatic_captions);
    const value: Array<string> = [];
    keys.map((key) => value.push(key));
    setAutomaticCaptions(keys);
  };

  const updateSubtitles = (data: YouTubePayload) => {
    const keys = Object.keys(data.subtitles);
    const value: Array<string> = [];
    keys.map((key) => value.push(key));
    setSubtitles(keys);
  };

  useEffect(() => {
    if (
      !link ||
      (!isYoutube(link) &&
        !isFacebook(link) &&
        !isTiktok(link) &&
        !isInstagram(link))
    ) {
      return;
    }
    setAutomaticCaptions([]);
    setSubtitles([]);
    setData(null);
    console.log('Renders video detail');
    setIsLoading(true);
    API.Post({
      url: '/get-video-details/',
      data: { url: link },
      jsonapi: false,
    })
      .then((response: { data: YouTubePayload }) => {
        if (response.data.automatic_captions) {
          updateAutomaticCaptions(response.data);
        }
        if (response.data.subtitles) {
          updateSubtitles(response.data);
        }
        if (response.data.title) {
          setTitle(response.data.title);
        }
        if (response.data.thumbnail) {
          setThumbnail(response.data.thumbnail);
        }
        setData(response.data);
      })
      .catch((e) => console.log('error', e))
      .finally(() => setIsLoading(false));
  }, [link]);

  const AutomaticCaptionsDropDown = (
    <Box width={120}>
      <FormControl fullWidth>
        <InputLabel id="captions-select-label">C. Captions</InputLabel>
        <Select
          labelId="captions-select-label"
          id="captions-select"
          label="C. Captions"
          size="small"
          defaultValue="auto"
          name="captions"
          value={captionSelected}
          onChange={(e) => {
            setCaptionSelected(e.target.value);
            setSubtitleSelected('auto');
          }}
        >
          <MenuItem value="auto">Auto</MenuItem>
          {automaticCaptions.map((key) => {
            return (
              <MenuItem key={key} value={key}>
                {key}
              </MenuItem>
            );
          })}
        </Select>
      </FormControl>
    </Box>
  );

  const SubtitlesDropDown = (
    <Box width={120}>
      <FormControl fullWidth>
        <InputLabel id="subtitles-select-label">Subtitles</InputLabel>
        <Select
          labelId="subtitles-select-label"
          id="subtitles-select"
          label="subtitles"
          size="small"
          defaultValue="auto"
          name="subtitles"
          value={subtitleSelected}
          onChange={(e) => {
            setSubtitleSelected(e.target.value);
            setCaptionSelected('auto');
          }}
        >
          <MenuItem value="auto">Auto</MenuItem>
          {subtitles.map((key) => {
            return (
              <MenuItem key={key} value={key}>
                {key}
              </MenuItem>
            );
          })}
        </Select>
      </FormControl>
    </Box>
  );

  return {
    isLoading,
    youTubePayload,
    title,
    thumbnail,
    AutomaticCaptionsDropDown: automaticCaptions.length
      ? AutomaticCaptionsDropDown
      : null,
    SubtitlesDropDown: subtitles.length ? SubtitlesDropDown : null,
    captionSelected,
    subtitleSelected,
  };
};

export default UseVideoDetails;
