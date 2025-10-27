'use client';

import React, { useState } from 'react';
import Box from '@mui/material/Box';
import { useRouter } from 'next/navigation';
import CTOIconButton from '@/components/cto-icon-button';
import { useVideoContext } from '@/state/video-reducer';
import APIGetBaseURLFromEnv from '@repo/helpers/api-get-base-url';
import GetBrowserLanguage from '@repo/ui/get-browser-language';
import OndemandVideoIcon from '@mui/icons-material/OndemandVideo';
import TranslateIcon from '@mui/icons-material/Translate';
import SubtitlesIcon from '@mui/icons-material/Subtitles';
import SpatialTrackingIcon from '@mui/icons-material/SpatialTracking';
import useProcessVideoAction, { LinkType } from '@/state/process-video-actions';
import { VideoType } from '@/state/video-type';
import isYoutube from '@repo/helpers/is-youtube-checker';
import MicIcon from '@mui/icons-material/Mic';
import VideoMoreOptions from '@/components/video-more-options';
import VideoChatIcon from '@mui/icons-material/VideoChat';

const VideoActions = () => {
  const { browserLanguage } = GetBrowserLanguage();
  const language = browserLanguage;
  const { video, dispatch } = useVideoContext();
  const router = useRouter();
  const ProcessVideoAction = useProcessVideoAction();
  const [showMoreOptions, setShowMoreOptions] = useState<boolean>(false);

  const setActiveLink = (video: VideoType, type: LinkType) => {
    video.activeLink = video.attributes[type];
    return dispatch({ type: 'patch-data', rawData: video });
  };

  const doneCallBack = (video: VideoType, type: LinkType, link: string) => {
    video.attributes[type] = link;
    setActiveLink(video, type);
    dispatch({ type: 'patch-data', rawData: video });
  };

  const progressCallBack = (video: VideoType, type: LinkType, link: string) => {
    video.attributes[type] = link;
    dispatch({ type: 'patch-data', rawData: video });
  };

  if (!video.attributes.transcriptions) {
    return null;
  }

  const content =
    video.attributes.local_link ||
    video.attributes.local_link_sub ||
    video.attributes.local_link_translated ||
    video.attributes.local_link_translated_audio ||
    video.attributes.local_link_podcast;

  return (
    <>
      {content ? (
        <>
          <Box
            padding={1}
            display="flex"
            justifyContent="space-evenly"
            flexWrap="wrap"
          >
            {(isYoutube(video.attributes.link) &&
              video.attributes.local_link_podcast) ||
            !isYoutube(video.attributes.link) ? (
              <CTOIconButton
                label={language === 'en' ? 'Original video' : 'Video original'}
                showLabel={showMoreOptions}
                link={video.attributes.local_link}
                activeLink={video.activeLink}
                onClick={() =>
                  isYoutube(video.attributes.link)
                    ? setActiveLink(video, 'link')
                    : setActiveLink(video, 'local_link')
                }
                onDoubleClick={() => {
                  const BaseURL = APIGetBaseURLFromEnv();
                  const url = `${BaseURL}/admin/video/video/${video.id}/change/`;
                  router.push(url);
                }}
              >
                <OndemandVideoIcon fontSize="small" />
              </CTOIconButton>
            ) : null}
            {!isYoutube(video.attributes.link) ? (
              <>
                <CTOIconButton
                  label={
                    language === 'en'
                      ? 'Original subtitles'
                      : 'Subtitulos originales'
                  }
                  showLabel={showMoreOptions}
                  link={video.attributes.local_link_sub}
                  activeLink={video.activeLink}
                  disabled={ProcessVideoAction.isLoading}
                  onClick={() => {
                    if (
                      video.attributes.local_link_sub &&
                      video.attributes.local_link_sub !== 'error'
                    ) {
                      return setActiveLink(video, 'local_link_sub');
                    }
                    ProcessVideoAction.exec({
                      video,
                      type: 'local_link_sub',
                      doneCallBack: (link) =>
                        doneCallBack(video, 'local_link_sub', link),
                      progressCallBack: (v) =>
                        progressCallBack(video, 'local_link_sub', v),
                    });
                  }}
                  onDoubleClick={() =>
                    ProcessVideoAction.exec({
                      video,
                      type: 'local_link_sub',
                      doneCallBack: (link) =>
                        doneCallBack(video, 'local_link_sub', link),
                      progressCallBack: (v) =>
                        progressCallBack(video, 'local_link_sub', v),
                    })
                  }
                >
                  <SubtitlesIcon fontSize="small" />
                </CTOIconButton>
                <CTOIconButton
                  label={
                    language === 'en'
                      ? 'Translated Subtitles'
                      : 'Subtitulos traducidos'
                  }
                  showLabel={showMoreOptions}
                  link={video.attributes.local_link_translated}
                  activeLink={video.activeLink}
                  disabled={ProcessVideoAction.isLoading}
                  onClick={() => {
                    if (
                      video.attributes.local_link_translated &&
                      video.attributes.local_link_translated !== 'error'
                    ) {
                      return setActiveLink(video, 'local_link_translated');
                    }
                    ProcessVideoAction.exec({
                      video,
                      type: 'local_link_translated',
                      doneCallBack: (link) =>
                        doneCallBack(video, 'local_link_translated', link),
                      progressCallBack: (v) =>
                        progressCallBack(video, 'local_link_translated', v),
                    });
                  }}
                  onDoubleClick={() =>
                    ProcessVideoAction.exec({
                      video,
                      type: 'local_link_translated',
                      doneCallBack: (link) =>
                        doneCallBack(video, 'local_link_translated', link),
                      progressCallBack: (v) =>
                        progressCallBack(video, 'local_link_translated', v),
                    })
                  }
                >
                  <TranslateIcon fontSize="small" />
                </CTOIconButton>
                <CTOIconButton
                  label={
                    language === 'en' ? 'Translated audio' : 'Audio traducido'
                  }
                  showLabel={showMoreOptions}
                  link={video.attributes.local_link_translated_audio}
                  activeLink={video.activeLink}
                  disabled={ProcessVideoAction.isLoading}
                  onClick={() => {
                    if (
                      video.attributes.local_link_translated_audio &&
                      video.attributes.local_link_translated_audio !== 'error'
                    ) {
                      return setActiveLink(
                        video,
                        'local_link_translated_audio'
                      );
                    }
                    ProcessVideoAction.exec({
                      video,
                      type: 'local_link_translated_audio',
                      doneCallBack: (link) =>
                        doneCallBack(
                          video,
                          'local_link_translated_audio',
                          link
                        ),
                      progressCallBack: (v) =>
                        progressCallBack(
                          video,
                          'local_link_translated_audio',
                          v
                        ),
                    });
                  }}
                  onDoubleClick={() =>
                    ProcessVideoAction.exec({
                      video,
                      type: 'local_link_translated_audio',
                      doneCallBack: (link: string) =>
                        doneCallBack(
                          video,
                          'local_link_translated_audio',
                          link
                        ),
                      progressCallBack: (v) =>
                        progressCallBack(
                          video,
                          'local_link_translated_audio',
                          v
                        ),
                    })
                  }
                >
                  <SpatialTrackingIcon fontSize="small" />
                </CTOIconButton>
              </>
            ) : null}
            {video.attributes.local_link_podcast ? (
              <CTOIconButton
                label="Podcast audio"
                showLabel={showMoreOptions}
                link={video.attributes.local_link_podcast}
                disabled={
                  video.attributes.podcast_script === 'processing' ||
                  ProcessVideoAction.isLoading
                }
                activeLink={video.activeLink}
                onClick={() => setActiveLink(video, 'local_link_podcast')}
              >
                <MicIcon fontSize="small" />
              </CTOIconButton>
            ) : null}
            {video.attributes.local_link_podcast_video ? (
              <CTOIconButton
                label="Podcast video"
                showLabel={showMoreOptions}
                link={video.attributes.local_link_podcast_video}
                disabled={
                  video.attributes.local_link_podcast === 'processing' ||
                  video.attributes.local_link_podcast_video === 'processing' ||
                  ProcessVideoAction.isLoading
                }
                activeLink={video.activeLink}
                onClick={() => setActiveLink(video, 'local_link_podcast_video')}
              >
                <VideoChatIcon fontSize="small" />
              </CTOIconButton>
            ) : null}
          </Box>
        </>
      ) : null}
      <VideoMoreOptions
        showMoreOptions={showMoreOptions}
        setShowMoreOptions={setShowMoreOptions}
      />
    </>
  );
};

export default VideoActions;
