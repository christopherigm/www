'use client';

import { useEffect, useState } from 'react';
import IconButton from '@mui/material/IconButton';
import ShareIcon from '@mui/icons-material/Share';
import LinkIcon from '@mui/icons-material/Link';
import copy from 'copy-to-clipboard';
import Snackbar from '@mui/material/Snackbar';
import GetBrowserLanguage from './get-browser-language';

type Props = {
  title: string;
  text: string;
  url: string;
  size?: 'small' | 'inherit' | 'large' | 'medium';
  color?: string;
  backgroundColor?: string;
};

const ShareButton = ({
  title,
  text,
  url,
  size = 'medium',
  color = '#111',
  backgroundColor,
}: Props) => {
  const { browserLanguage } = GetBrowserLanguage();
  const language = browserLanguage;
  const [canShare, setCanShare] = useState<boolean>(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setCanShare(navigator !== undefined && navigator.share !== undefined);
  }, []);

  return (
    <>
      {canShare ? (
        <IconButton
          aria-label="back"
          sx={{
            margin: 0,
            backgroundColor: `${backgroundColor} !important`,
            boxShadow: '0px 0px 5px rgba(13, 13, 13, 0.24)',
          }}
          onClick={() => {
            navigator.share({ title, text, url }).catch((e) => console.log(e));
          }}
        >
          <ShareIcon htmlColor={color} fontSize={size} />
        </IconButton>
      ) : (
        <IconButton
          aria-label="back"
          sx={{
            margin: 0,
            backgroundColor: `${backgroundColor} !important`,
            boxShadow: '0px 0px 5px rgba(13, 13, 13, 0.24)',
          }}
          onClick={() => {
            copy(url);
            setOpen(true);
          }}
        >
          <LinkIcon htmlColor={color} fontSize={size} />
        </IconButton>
      )}
      <Snackbar
        open={open}
        onClose={() => setOpen(false)}
        autoHideDuration={2000}
        message={
          language === 'en' ? 'Link copied to clipboard' : 'Link copiado!'
        }
      />
    </>
  );
};

export default ShareButton;
