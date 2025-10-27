'use client';

import React from 'react';
import { useVideoContext } from '@/state/video-reducer';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import { VideoType } from '@/state/video-type';
import {
  GetLocalStorageData,
  SetLocalStorageData,
} from '@repo/helpers/local-storage';
import DeleteVideo from '@/lib/delete-video';
import { useRouter } from 'next/navigation';

type Props = {
  id: string;
  routeToNextVideo?: boolean;
  callback?: (data: Array<VideoType>) => void;
  backgroundColor?: string;
  size?: 'small' | 'medium' | 'large';
};

const DeleteVideoButton = ({
  id,
  routeToNextVideo = false,
  callback,
  backgroundColor,
  size = 'small',
}: Props) => {
  const { video, dispatch } = useVideoContext();
  const router = useRouter();

  const DeleteVideoFromLocalStorage = () => {
    const data: Array<VideoType> = JSON.parse(
      GetLocalStorageData('videos') ?? '[]'
    );
    let index = -1;
    let prev = '';
    let next = '';
    data.map((i: VideoType, idx: number) => {
      if (i.id === id) {
        index = idx;
        if (index > 0) {
          prev = `/videos/${data[index - 1].attributes.uuid ?? ''}`;
        }
        if (index < data.length - 1) {
          next = `/videos/${data[index + 1].attributes.uuid ?? ''}`;
        }
      }
      return i;
    });
    if (index > -1) {
      data.splice(index, 1);
      SetLocalStorageData('videos', JSON.stringify(data));
    }
    if (routeToNextVideo) {
      if (next) {
        router.push(next);
      } else if (prev) {
        router.push(prev);
      } else {
        router.push('/');
      }
    }
    if (callback !== undefined) {
      callback(data);
    }
    dispatch({ type: 'loading', isLoading: false });
  };

  const DeleteVideoFn = () => {
    dispatch({ type: 'loading', isLoading: true });
    DeleteVideo(id).finally(() => DeleteVideoFromLocalStorage());
  };

  return (
    <IconButton
      aria-label="delete"
      size={size}
      onClick={() => DeleteVideoFn()}
      color="error"
      disabled={video.isLoading}
      style={{
        width: size === 'small' ? 35 : 40,
        height: size === 'small' ? 35 : 40,
        boxShadow: '0px 0px 5px rgba(13, 13, 13, 0.24)',
        backgroundColor,
      }}
    >
      <DeleteIcon fontSize={size} />
    </IconButton>
  );
};

export default DeleteVideoButton;
