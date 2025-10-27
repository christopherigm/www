'use client';

import React, { memo, ReactNode, useCallback, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Typography from '@mui/material/Typography';
import SendIcon from '@mui/icons-material/Send';
import DeleteIcon from '@mui/icons-material/Delete';
import { useSystemContext } from '@/state/system-reducer';
import GetBrowserLanguage from '@repo/ui/get-browser-language';
import HorizontalDivisor from '@repo/ui/horizontal-divisor';
import useProcessPrompt, { ProcessPromptProps } from '@/state/process-prompt';
import { useVideoContext } from '@/state/video-reducer';
import IconButtonMenu from '@repo/ui/icon-button-menu';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import copy from 'copy-to-clipboard';
import IconButton from '@mui/material/IconButton';
import Modal from '@mui/material/Modal';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import Paper from '@mui/material/Paper';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import TranslucentPaper from '@repo/ui/translucent-paper';

type RecordedPromptsProps = {
  recordedPrompts: Array<string>;
  ProcessPrompt: (props: ProcessPromptProps) => void;
  onDelete: (index: number) => void;
  showList?: boolean;
  isLoading?: boolean;
  sendCallback?: (prompt: string) => void;
};

const RecordedPrompts = ({
  recordedPrompts,
  ProcessPrompt,
  onDelete,
  showList = true,
  isLoading = false,
  sendCallback,
}: RecordedPromptsProps) => {
  const { video, dispatch } = useVideoContext();
  const { browserLanguage } = GetBrowserLanguage();
  const language = browserLanguage;
  const [expanded, setExpanded] = useState<boolean>(false);

  const Prompts = () => {
    return (
      <List
        sx={{
          width: '100%',
          height: '100%',
          maxHeight: expanded ? '80vh' : 140,
          position: 'relative',
          overflow: 'auto',
          '& ul': { padding: 0 },
        }}
        disablePadding
      >
        {recordedPrompts.map((prompt: string, index: number) => (
          <ListItem key={index} disablePadding>
            <Box display="flex" flexDirection="column" width="100%">
              <Box display="flex" alignItems="center">
                <Typography variant="body1">{prompt}</Typography>
                <Box flexGrow={1} />
                <Box width={10} flexShrink={0} />
                <IconButtonMenu
                  isLoading={isLoading}
                  items={[
                    {
                      text: language === 'en' ? 'Use prompt' : 'Usar prompt',
                      icon: <SendIcon fontSize="small" color="success" />,
                      onClick: () => {
                        if (sendCallback !== undefined) {
                          sendCallback(prompt);
                        } else {
                          ProcessPrompt({
                            video,
                            prompt,
                            CallBack: (rawData) =>
                              dispatch({ type: 'patch-data', rawData }),
                          });
                        }
                        setExpanded(false);
                      },
                    },
                    {
                      text: language === 'en' ? 'Copy prompt' : 'Copiar prompt',
                      icon: (
                        <ContentCopyIcon fontSize="small" color="warning" />
                      ),
                      onClick: () => {
                        copy(prompt);
                        setExpanded(false);
                      },
                    },
                    {
                      text:
                        language === 'en' ? 'Delete prompt' : 'Eliminar prompt',
                      icon: <DeleteIcon fontSize="small" color="error" />,
                      onClick: () => onDelete(index),
                    },
                  ]}
                />
              </Box>
              <HorizontalDivisor margin={1} />
            </Box>
          </ListItem>
        ))}
      </List>
    );
  };

  if (expanded) {
    return (
      <Modal
        open={expanded}
        onClose={() => setExpanded(false)}
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          height: '100vh',
        }}
      >
        <Box width="100%" maxWidth={600} padding={2}>
          <Paper elevation={2}>
            <Box padding={1} display="flex" flexDirection="column">
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="body1" fontWeight="bold">
                  {language === 'en' ? 'Saved prompts' : 'Prompts guardados'}
                </Typography>
                <IconButton
                  aria-label="close"
                  size="small"
                  onClick={() => setExpanded(false)}
                  color="error"
                  disabled={isLoading}
                  style={{
                    width: 35,
                    height: 35,
                    boxShadow: '0px 0px 5px rgba(13, 13, 13, 0.24)',
                  }}
                >
                  <CloseFullscreenIcon fontSize="small" />
                </IconButton>
              </Box>
              <HorizontalDivisor margin={1} />
              <Prompts />
            </Box>
          </Paper>
        </Box>
      </Modal>
    );
  }

  return (
    <>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="body1" fontWeight={showList ? 'bold' : 'normal'}>
          {language === 'en' ? 'Saved prompts' : 'Prompts guardados'}
        </Typography>
        <IconButton
          aria-label="expand"
          size="small"
          onClick={() => setExpanded(true)}
          color="info"
          disabled={isLoading}
          style={{
            width: 35,
            height: 35,
            boxShadow: '0px 0px 5px rgba(13, 13, 13, 0.24)',
          }}
        >
          {showList ? (
            <OpenInFullIcon fontSize="small" />
          ) : (
            <OpenInNewIcon fontSize="small" />
          )}
        </IconButton>
      </Box>
      <HorizontalDivisor margin={1} />
      {showList ? <Prompts /> : null}
    </>
  );
};

const RecordedPromptsMemo = memo(RecordedPrompts);

type Props = {
  showList?: boolean;
  sendCallback?: (prompt: string) => void;
  container?: boolean;
  status?: string;
};

const RecordedPromptsWrapper = ({
  showList = true,
  sendCallback,
  container = false,
  status,
}: Props) => {
  const { state, dispatch } = useSystemContext();
  const { video } = useVideoContext();
  const { exec } = useProcessPrompt();

  const recordedPrompts = useMemo(
    () => state.recordedPrompts,
    [state.recordedPrompts]
  );

  const process = useCallback(exec, [exec]);

  if (
    !state.recordedPrompts.length ||
    status === 'error' ||
    status === 'processing' ||
    !video.attributes.transcriptions
  ) {
    return;
  }

  const Container = ({ children }: { children: ReactNode }) => {
    return container ? (
      <TranslucentPaper>
        <Box padding={1}>{children}</Box>
      </TranslucentPaper>
    ) : (
      <>{children}</>
    );
  };

  return (
    <Container>
      <RecordedPromptsMemo
        recordedPrompts={recordedPrompts}
        ProcessPrompt={process}
        onDelete={(index: number) => dispatch({ type: 'delete-item', index })}
        showList={showList}
        // isLoading={video.isLoading}
        sendCallback={sendCallback}
      />
    </Container>
  );
};

export default RecordedPromptsWrapper;
