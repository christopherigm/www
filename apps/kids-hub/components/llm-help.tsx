import { useState } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import API from '@repo/helpers/api/index';
import type Languages from '@repo/interfaces/languages';
import LLMStatistics from '@/components/llm-statistics';

import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import PauseIcon from '@mui/icons-material/Pause';
import StopIcon from '@mui/icons-material/Stop';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import Typography from '@mui/material/Typography';
import type { GenerateResponse } from 'ollama';
import Button from '@mui/material/Button';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

type Props = {
  prompt: string;
  isLoading: boolean;
  onLoading?: (value: boolean) => void;
  language: Languages;
};

const useLLMHelp = ({
  prompt = '',
  isLoading = false,
  onLoading,
  language = 'en',
}: Props) => {
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [help, setHelp] = useState<string>('');
  const [totalDuration, setTotalDuration] = useState<number>(0);
  const [evalCount, setEvalCount] = useState<number>(0);

  const getHelp = () => {
    onLoading && onLoading(true);
    stop();
    if (help && window && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setHelp('');
    const data = { prompt };

    API.Post({
      url: '/llm-query',
      data,
      jsonapi: false,
    })
      .then((data: GenerateResponse) => {
        const response = data.response ?? '';
        setHelp(response);
        setEvalCount(Number(data.eval_count ?? 0));
        setTotalDuration(Number(data.total_duration ?? 0));
      })
      .catch((e) => {
        console.log('>>> LLM Error:', e.toString());
        setHelp('There was a connection error, I am sorry!');
        onLoading && onLoading(false);
      })
      .finally(() => onLoading && onLoading(false));
  };

  const read = () => {
    if (help && window && window.speechSynthesis) {
      setIsSpeaking(true);
      setIsPaused(false);
      const utterance = new SpeechSynthesisUtterance(help);
      window.speechSynthesis.speak(utterance);
      utterance.onend = () => setIsSpeaking(false);
    }
  };

  const pause = () => {
    if (help && window && window.speechSynthesis) {
      setIsPaused(true);
      window.speechSynthesis.pause();
    }
  };

  const play = () => {
    if (help && window && window.speechSynthesis) {
      setIsPaused(false);
      window.speechSynthesis.resume();
    }
  };

  const stop = () => {
    if (help && window && window.speechSynthesis) {
      setIsSpeaking(false);
      setIsPaused(false);
      window.speechSynthesis.cancel();
    }
  };

  const clearHelp = () => {
    stop();
    setHelp('');
    setTotalDuration(0);
    setEvalCount(0);
  };

  const HelpButton = (
    <Button
      variant="contained"
      disabled={isLoading}
      endIcon={<AutoAwesomeIcon />}
      loading={isLoading}
      onClick={() => getHelp()}
      size="small"
      sx={{
        marginRight: 2,
        textTransform: 'inherit',
      }}
    >
      {language === 'en' ? 'AI Help' : 'Ayuda de I.A.'}
    </Button>
  );

  const LLMHelp = help && (
    <Grid size={{ xs: 12 }} display="flex" flexDirection="column">
      {window && window.speechSynthesis ? (
        <Box
          display="flex"
          justifyContent="center"
          marginTop={1}
          marginBottom={1}
        >
          {isSpeaking ? (
            <Box display="flex" justifyContent="space-between" minWidth={140}>
              <IconButton
                aria-label="stop"
                size="large"
                onClick={() => stop()}
                color="default"
              >
                <StopIcon fontSize="large" />
              </IconButton>
              {isPaused ? (
                <IconButton
                  aria-label="play"
                  size="large"
                  onClick={() => play()}
                  color="default"
                >
                  <PlayArrowIcon fontSize="large" />
                </IconButton>
              ) : (
                <IconButton
                  aria-label="pause"
                  size="large"
                  onClick={() => pause()}
                  color="default"
                >
                  <PauseIcon fontSize="large" />
                </IconButton>
              )}
            </Box>
          ) : (
            <IconButton
              aria-label="read"
              size="large"
              onClick={() => read()}
              color="default"
            >
              <VolumeUpIcon fontSize="large" />
            </IconButton>
          )}
        </Box>
      ) : null}
      <Typography variant="body1" align="justify">
        {help}
      </Typography>
      <LLMStatistics
        evalCount={evalCount}
        totalDuration={totalDuration}
        language={language}
      />
    </Grid>
  );

  return {
    LLMHelp,
    HelpButton,
    getHelp,
    help,
    isLoading,
    stop,
    play,
    pause,
    clearHelp,
  };
};

export default useLLMHelp;
