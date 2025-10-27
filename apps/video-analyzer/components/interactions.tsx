'use client';

import React, { memo } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import GetBrowserLanguage from '@repo/ui/get-browser-language';
import DeleteIcon from '@mui/icons-material/Delete';
import HorizontalDivisor from '@repo/ui/horizontal-divisor';
import Divisor from '@repo/ui/divisor';
import Markdown from 'react-markdown';
import { DeleteNewAnalysis, useVideoContext } from '@/state/video-reducer';
import { type VideoAnalysisType } from '@/state/analysis-type';
import DeleteAnalysis from '@/lib/delete-analysis';
import UpdateVideoRelationships from '@/lib/update-video-relationships';
import GetVideoByID from '@/lib/get-video-by-id';
import { VideoType } from '@/state/video-type';
import { GetDifferenceInSeconds } from '@repo/helpers/date-parser';
import ButtonToCopy from '@repo/ui/button-to-copy';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import { useSystemContext } from '@/state/system-reducer';

type BubbleProps = {
  id?: string;
  index?: number;
  label: string;
  text: string;
  type: 'left' | 'right';
  isLoading?: boolean;
  ProcessRequest: (id: string, index: number) => void;
};

export const Bubble = ({
  id,
  index,
  label,
  text,
  type,
  isLoading = false,
  ProcessRequest,
}: BubbleProps) => {
  const { dispatch } = useSystemContext();
  const { state } = useSystemContext();

  const promptIndex = state.recordedPrompts.findIndex((i) => i === text);

  return (
    <Box
      display="flex"
      flexDirection="column"
      paddingX={1.5}
      paddingY={1}
      className={`bubble ${type}`}
    >
      <Box>
        <Typography variant="caption">{label}</Typography>
        <Markdown>{text}</Markdown>
      </Box>
      <Box>
        <HorizontalDivisor margin={1} />
      </Box>
      <Box display="flex" justifyContent="end">
        {id && index !== undefined ? (
          <>
            <IconButton
              aria-label="delete"
              size="small"
              onClick={() => ProcessRequest(id, index)}
              color="error"
              disabled={isLoading}
              style={{
                width: 35,
                height: 35,
                boxShadow: '0px 0px 5px rgba(13, 13, 13, 0.24)',
                backgroundColor: 'rgba(0, 0, 0, 0.57)',
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
            <Box width={10} />
          </>
        ) : (
          <>
            <IconButton
              aria-label="save/delete"
              size="small"
              onClick={() => {
                if (promptIndex > -1) {
                  dispatch({ type: 'delete-item', index: promptIndex });
                } else {
                  dispatch({ type: 'add-item', newItem: text });
                }
              }}
              color={promptIndex > -1 ? 'warning' : 'inherit'}
              disabled={isLoading}
              style={{
                width: 35,
                height: 35,
                boxShadow: '0px 0px 5px rgba(13, 13, 13, 0.24)',
                backgroundColor: 'rgba(0, 0, 0, 0.57)',
              }}
            >
              <BookmarkIcon fontSize="small" />
            </IconButton>
            <Box width={10} />
          </>
        )}
        <ButtonToCopy
          text={text}
          isLoading={isLoading}
          backgroundColor="rgba(0, 0, 0, 0.57)"
        />
      </Box>
    </Box>
  );
};

export const BubbleMemo = memo(Bubble);

const Interactions = () => {
  const { browserLanguage } = GetBrowserLanguage();
  const language = browserLanguage;
  const { video, dispatch } = useVideoContext();

  const ProcessRequest = (id: string, index: number) => {
    dispatch({ type: 'loading', isLoading: true });
    DeleteAnalysis(id)
      .then(() => {
        const VideoWithNewAnalysis = DeleteNewAnalysis(video, index);
        UpdateVideoRelationships(VideoWithNewAnalysis)
          .then(() => {
            GetVideoByID(video.id)
              .then((rawData: VideoType) => {
                dispatch({ type: 'patch-data', rawData });
                dispatch({ type: 'loading', isLoading: false });
              })
              .catch(() => dispatch({ type: 'loading', isLoading: false }));
          })
          .catch(() => dispatch({ type: 'loading', isLoading: false }));
      })
      .catch(() => dispatch({ type: 'loading', isLoading: false }));
  };

  if (video.attributes.status === 'error' || !video.attributes.transcriptions) {
    return;
  }

  return (
    <Box display="flex" flexDirection="column">
      {video.relationships.analysis.data
        .sort((a, b) => Number(a.id) - Number(b.id))
        .map((videoAnalisys: VideoAnalysisType, index: number) => {
          let time = '';
          if (
            videoAnalisys.attributes.started &&
            videoAnalisys.attributes.ended
          ) {
            const diff = GetDifferenceInSeconds(
              new Date(videoAnalisys.attributes.started),
              new Date(videoAnalisys.attributes.ended)
            );
            time = `AI (${diff}s`;
          }
          const w_node = videoAnalisys.attributes.worker_node
            ? `, ${videoAnalisys.attributes.worker_node}):`
            : null;

          return (
            <Box key={index} display="flex" flexDirection="column">
              {videoAnalisys.attributes.requested_characteristics ? (
                <Box display="flex" justifyContent="end">
                  <BubbleMemo
                    label={language === 'en' ? 'You:' : 'Tu:'}
                    text={videoAnalisys.attributes.requested_characteristics}
                    type="right"
                    ProcessRequest={ProcessRequest}
                  />
                </Box>
              ) : null}
              {videoAnalisys.attributes.status === 'processing' ? (
                <Box width="100%" marginTop={1}>
                  <LinearProgress />
                </Box>
              ) : null}
              {videoAnalisys.attributes.summary ? (
                <>
                  <Divisor />
                  <Box display="flex" justifyContent="start">
                    <BubbleMemo
                      id={videoAnalisys.id}
                      index={index}
                      label={`${time}${w_node}`}
                      text={videoAnalisys.attributes.summary}
                      type="left"
                      ProcessRequest={ProcessRequest}
                    />
                  </Box>
                </>
              ) : null}
              <Divisor />
            </Box>
          );
        })}
    </Box>
  );
};

export default Interactions;
