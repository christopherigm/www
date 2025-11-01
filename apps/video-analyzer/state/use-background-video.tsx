'use client';

import { useState } from 'react';
import { useSystemContext } from '@/state/system-reducer';
import { BackgroundVideoType } from '@/state/background-video-type';
import {
  APICreate,
  APIGetByID,
  APIGetAll,
  APIDelete,
} from '@/lib/crud-background-video';

type CB = (background: BackgroundVideoType) => void;

type CreateBackgroundVideoProps = {
  url: string;
  timeLength: number;
  upscaleFPS: number;
  transitionDuration: number;
  doneCallBack: CB;
};

type StatusProps = {
  id: string;
  doneCallBack: CB;
};

const useBackgroundVideo = () => {
  const { dispatch } = useSystemContext();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const isCompleted = (field: string): boolean => {
    return field !== null && field !== '' && field !== 'processing';
  };

  const CheckStatus = ({ id, doneCallBack }: StatusProps) => {
    APIGetByID(id)
      .then((data: BackgroundVideoType) => {
        if (isCompleted(data.attributes.status)) {
          setIsLoading(false);
          GetAll();
          return doneCallBack(data);
        } else {
          setTimeout(() => CheckStatus({ id, doneCallBack }), 3000);
        }
      })
      .catch(() => setTimeout(() => CheckStatus({ id, doneCallBack }), 3000));
  };

  const Create = ({
    url,
    timeLength,
    upscaleFPS,
    transitionDuration,
    doneCallBack,
  }: CreateBackgroundVideoProps) => {
    if (!url || !timeLength) {
      return;
    }
    setIsLoading(true);
    APICreate({
      link: url,
      time_length: timeLength,
      transition_duration: transitionDuration,
      fps: upscaleFPS,
    })
      .then(({ id }: BackgroundVideoType) => {
        GetAll();
        CheckStatus({ id, doneCallBack });
      })
      .catch((error) => {
        setIsLoading(false);
        console.log('>> video.save() error:', error);
      });
  };

  const GetAll = () => {
    APIGetAll()
      .then((backgroundVideos) => {
        dispatch({
          type: 'set-background-videos',
          backgroundVideos,
        });
        // backgroundVideos.map((i) => {
        //   if (!RequestCompleted(i.attributes.status)) {
        //     CheckStatus({id: i.id, doneCallBack: () => {}})
        //   }
        // })
      })
      .catch((error) => console.log('>> video.save() error:', error))
      .finally(() => setIsLoading(false));
  };

  const DeleteByID = (id: string) => {
    setIsLoading(true);
    APIDelete(id)
      .then(() => GetAll())
      .catch((error) => {
        setIsLoading(false);
        console.log('>> video.save() error:', error);
      });
  };

  return {
    isLoading,
    Create,
    CheckStatus,
    GetAll,
    isCompleted,
    DeleteByID,
  };
};

export default useBackgroundVideo;
