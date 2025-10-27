'use client';

import React, { useEffect, useState } from 'react';
import type Languages from '@repo/interfaces/languages';
import IconButton from '@mui/material/IconButton';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { GetLocalStorageData } from '@repo/helpers/local-storage';
import { VideoType } from '@/state/video-type';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Box from '@mui/material/Box';

type Props = {
  language: Languages;
  primaryColor: string;
  darkNavBar?: boolean;
};

const PersisteMenu = ({}: Props) => {
  const [isHome, setIsHome] = useState<boolean>(false);
  const pathname = usePathname();
  const [prev, setPrev] = useState<string>('');
  const [next, setNext] = useState<string>('');

  useEffect(() => {
    setIsHome(pathname === '/');
  }, [pathname]);

  useEffect(() => {
    if (pathname !== '/') {
      const id = pathname.split('/')[2];
      const data: Array<VideoType> = JSON.parse(
        GetLocalStorageData('videos') ?? '[]'
      );
      setNext('');
      setPrev('');
      data.reverse().map((i: VideoType, index: number) => {
        if (i.attributes.uuid === id) {
          if (index > 0) {
            setPrev(
              `/videos/${data[index - 1].attributes.uuid ?? 'invalid-id'}`
            );
          }
          if (index < data.length - 1) {
            setNext(
              `/videos/${data[index + 1].attributes.uuid ?? 'invalid-id'}`
            );
          }
        }
      });
    }
  }, [pathname]);

  return (
    <>
      {!isHome ? (
        <>
          {prev && pathname !== '/about' ? (
            <>
              <Link href={prev}>
                <IconButton aria-label="add" size="medium" color="info">
                  <ArrowBackIcon fontSize={'medium'} />
                </IconButton>
              </Link>
              <Box width={10} />
            </>
          ) : null}

          {pathname !== '/' && pathname !== '/about' ? (
            <Link href="/">
              <IconButton aria-label="add" size="medium" color="success">
                <AddCircleOutlineIcon fontSize={'medium'} />
              </IconButton>
            </Link>
          ) : null}
          {next && pathname !== '/about' ? (
            <>
              <Box width={10} />
              <Link href={next}>
                <IconButton aria-label="add" size="medium" color="info">
                  <ArrowForwardIcon fontSize={'medium'} />
                </IconButton>
              </Link>
            </>
          ) : null}
        </>
      ) : null}
    </>
  );
};

export default PersisteMenu;
