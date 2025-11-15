'use client';

import { useState } from 'react';
import { useSystemContext } from '@/state/system-reducer';
import { BackgroundMusicType } from '@/state/background-music-type';
import {
  APICreateNewMusic,
  APIGetMusicByID,
  APIGetAllMusic,
  APIDeleteMusic,
} from '@/lib/crud-music';

type CB = (music: BackgroundMusicType) => void;

type CreateMusicProps = {
  url: string;
  timeLength: number;
  doneCallBack: CB;
};

type StatusProps = {
  id: string;
  doneCallBack: CB;
};

const useBackgroundMusic = () => {
  const { dispatch } = useSystemContext();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const RequestCompleted = (field: string): boolean => {
    return field !== null && field !== '' && field !== 'processing';
  };

  const CheckStatus = ({ id, doneCallBack }: StatusProps) => {
    APIGetMusicByID(id)
      .then((data: BackgroundMusicType) => {
        if (RequestCompleted(data.attributes.status)) {
          setIsLoading(false);
          GetAllMusic();
          return doneCallBack(data);
        } else {
          setTimeout(() => CheckStatus({ id, doneCallBack }), 3000);
        }
      })
      .catch(() => setTimeout(() => CheckStatus({ id, doneCallBack }), 3000));
  };

  const CreateMusic = ({ url, timeLength, doneCallBack }: CreateMusicProps) => {
    if (!url || !timeLength) {
      return;
    }
    setIsLoading(true);
    APICreateNewMusic({
      link: url,
      time_length: timeLength,
    })
      .then(({ id }: BackgroundMusicType) => {
        GetAllMusic();
        CheckStatus({ id, doneCallBack });
      })
      .catch((error) => {
        setIsLoading(false);
        console.log('>> video.save() error:', error);
      });
  };

  const GetAllMusic = () => {
    APIGetAllMusic()
      .then((backgroundMusic) => {
        dispatch({
          type: 'set-background-music',
          backgroundMusic,
        });
        // musicVideos.map((i) => {
        //   if (!RequestCompleted(i.attributes.status)) {
        //     CheckStatus({id: i.id, doneCallBack: () => {}})
        //   }
        // })
      })
      .catch((error) => console.log('>> video.save() error:', error))
      .finally(() => setIsLoading(false));
  };

  const DeleteMusicByID = (id: string) => {
    setIsLoading(true);
    APIDeleteMusic(id)
      .then(() => GetAllMusic())
      .catch((error) => {
        setIsLoading(false);
        console.log('>> video.save() error:', error);
      });
  };

  return {
    isLoading,
    CreateMusic,
    CheckStatus,
    GetAllMusic,
    RequestCompleted,
    DeleteMusicByID,
  };
};

export default useBackgroundMusic;
