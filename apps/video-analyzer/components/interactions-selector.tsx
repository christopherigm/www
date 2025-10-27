'use client';

import Box from '@mui/material/Box';
import Interactions from '@/components/interactions';
import ChatBox from '@/components/chat-box';
import PodcastScriptInteractions, {
  type PodcastInteraction,
} from '@/components/podcast-script-interactions';
import { useVideoContext } from '@/state/video-reducer';
import GetBrowserLanguage from '@repo/ui/get-browser-language';
import TranslucentPaper from '@repo/ui/translucent-paper';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import Button from '@mui/material/Button';
import MicIcon from '@mui/icons-material/Mic';
import { useEffect, useState } from 'react';
import Divisor from '@repo/ui/divisor';
import Podcast from '@/components/podcast';
import RecordedPrompts from '@/components/recorded-prompts';
import HorizontalDivisor from '@repo/ui/horizontal-divisor';
import { useSystemContext } from '@/state/system-reducer';

const InteractionsSelector = () => {
  const { browserLanguage } = GetBrowserLanguage();
  const language = browserLanguage;
  const { state } = useSystemContext();
  const { video } = useVideoContext();
  const [podcastScript, setPodcastScript] = useState<Array<PodcastInteraction>>(
    []
  );
  const [selected, setSelected] = useState<'' | 'podcast' | 'interactions'>(
    'interactions'
  );

  useEffect(() => {
    if (
      video.attributes.podcast_script &&
      video.attributes.podcast_script !== 'error' &&
      video.attributes.podcast_script !== 'processing'
    ) {
      try {
        const podcastScript: Array<PodcastInteraction> = JSON.parse(
          video.attributes.podcast_script ?? '[]'
        );
        setPodcastScript(podcastScript);
      } catch {
        setPodcastScript([]);
      }
    } else {
      setPodcastScript([]);
    }
  }, [video.attributes.podcast_script]);

  if (!video.attributes.transcriptions) {
    return null;
  }

  return (
    <>
      <TranslucentPaper>
        <Box padding={1} display="flex" flexDirection="column">
          <Box display="flex">
            <Button
              variant={selected === 'interactions' ? 'contained' : 'text'}
              color="inherit"
              endIcon={
                <AutoAwesomeIcon
                  color={selected === 'interactions' ? 'success' : 'inherit'}
                />
              }
              sx={{
                textTransform: 'initial',
              }}
              onClick={() => setSelected('interactions')}
              fullWidth
            >
              {language === 'en' ? 'Interactions' : 'Interacciones'}
            </Button>
            <Box width={10} flexShrink={0} />
            <Button
              variant={selected === 'podcast' ? 'contained' : 'text'}
              color="inherit"
              endIcon={
                <MicIcon
                  color={selected === 'podcast' ? 'success' : 'inherit'}
                />
              }
              sx={{
                textTransform: 'initial',
              }}
              onClick={() => setSelected('podcast')}
              fullWidth
            >
              {language === 'en' ? 'Podcast' : 'Podcast'}
            </Button>
          </Box>
          {selected === 'interactions' && state.recordedPrompts.length ? (
            <>
              <HorizontalDivisor margin={1} />
              <RecordedPrompts showList={false} />
            </>
          ) : selected === 'podcast' ? (
            <>
              <HorizontalDivisor margin={1} />
              <Podcast />
            </>
          ) : null}
        </Box>
      </TranslucentPaper>
      <Divisor />
      {selected === 'interactions' ? (
        <>
          <Interactions />
          <Box height={60} />
          <ChatBox />
        </>
      ) : selected === 'podcast' ? (
        <PodcastScriptInteractions podcastScript={podcastScript} />
      ) : null}
    </>
  );
};

export default InteractionsSelector;
