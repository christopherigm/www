'use client';

import Box from '@mui/material/Box';
import { useRef, useState, useEffect } from 'react';

import Song from '@/classes/song';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Dialog from '@repo/ui/dialog';
import resizeBase64Image from '@repo/helpers/resize-base64-image';
import GetEnvVariables from '@repo/helpers/get-env-variables';
import GetBrowserLanguage from '@repo/ui/get-browser-language';
import GenericImage from '@repo/ui/generic-image/generic-image';

import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';

import ReactPlayer from 'react-player';
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import CloseIcon from '@mui/icons-material/Close';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import OndemandVideoIcon from '@mui/icons-material/OndemandVideo';
import PianoIcon from '@mui/icons-material/Piano';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import ArrowCircleLeftIcon from '@mui/icons-material/ArrowCircleLeft';
import ArrowCircleRightIcon from '@mui/icons-material/ArrowCircleRight';
import CropPortraitIcon from '@mui/icons-material/CropPortrait';
import CropLandscapeIcon from '@mui/icons-material/CropLandscape';
import CropSquareIcon from '@mui/icons-material/CropSquare';
import Crop169Icon from '@mui/icons-material/Crop169';

import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import DoNotDisturbIcon from '@mui/icons-material/DoNotDisturb';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import LinearProgress from '@mui/material/LinearProgress';
import SyncIcon from '@mui/icons-material/Sync';
import Link from 'next/link';
import { APISong } from '../types/song';

import LibraryMusicIcon from '@mui/icons-material/LibraryMusic';
import HdIcon from '@mui/icons-material/Hd';
import { system } from '@/classes/system';
import {
  FormControlLabel,
  FormGroup,
  Switch,
  useColorScheme,
} from '@mui/material';

const Divisor = () => <Box height={10}></Box>;

type SongPlayerProps = {
  onClick: () => void;
  href: string;
  mp3?: boolean;
  hd?: boolean;
  video?: boolean;
  playing?: boolean;
  karaoke?: boolean;
  vocal?: boolean;
  karaokeVideo?: boolean;
  photoVideo?: boolean;
};

const SongPlayer = ({
  onClick,
  href,
  mp3 = false,
  hd = false,
  video = false,
  playing = false,
  karaoke = false,
  vocal = false,
  karaokeVideo = false,
  photoVideo = false,
}: SongPlayerProps) => {
  const { mode } = useColorScheme();
  const boxShadow =
    mode === 'dark'
      ? '0px 0px 3px rgba(255,255,255,0.2)'
      : '0px 0px 5px rgba(13, 13, 13, 0.24)';
  const playingBoxShadow = playing
    ? mode === 'dark'
      ? '0px 0px 7px rgb(0, 255, 4)'
      : '0px 0px 7px rgb(0, 106, 255)'
    : null;

  return (
    <Box display="flex" justifyContent="space-between" padding={1}>
      <Box display="flex" alignItems="center">
        {hd ? <HdIcon fontSize="small" htmlColor="rgb(194, 144, 15)" /> : null}
        {mp3 ? <LibraryMusicIcon fontSize="small" color="info" /> : null}
        {video ? <OndemandVideoIcon fontSize="small" htmlColor="red" /> : null}
        {karaoke ? (
          <PianoIcon fontSize="small" htmlColor="rgb(0, 178, 45)" />
        ) : null}
        {vocal ? (
          <RecordVoiceOverIcon fontSize="small" htmlColor="rgb(139, 12, 186)" />
        ) : null}
        {karaokeVideo ? (
          <OndemandVideoIcon fontSize="small" htmlColor="rgb(233, 127, 56)" />
        ) : null}
        {photoVideo ? (
          <PhotoCameraIcon fontSize="small" htmlColor="rgb(159, 159, 18)" />
        ) : null}

        <Box width={5} />
        <Typography variant="body2">
          {hd
            ? 'HD Audio'
            : mp3
              ? 'Mp3 Audio'
              : video
                ? 'Video'
                : karaoke
                  ? 'karaoke'
                  : vocal
                    ? 'Voz'
                    : karaokeVideo
                      ? 'Karaoke video'
                      : photoVideo
                        ? 'Foto video'
                        : ''}
        </Typography>
      </Box>
      <Box display="flex">
        <Link href={href} download>
          <Box borderRadius={5} boxShadow={boxShadow}>
            <IconButton aria-label="play" size="small">
              <DownloadIcon fontSize="small" color="info" />
            </IconButton>
          </Box>
        </Link>
        <Box width={15} />
        <Box
          borderRadius={5}
          boxShadow={playingBoxShadow ?? boxShadow}
          onClick={onClick}
        >
          <IconButton aria-label="play" size="small">
            <PlayArrowIcon
              fontSize="small"
              color={playing ? 'success' : 'info'}
              className={playing ? 'rotating' : ''}
            />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

type ResourceButtonProps = {
  onClick: () => void;
  text: string;
  disabled?: boolean;
  add?: boolean;
};

const ResourceButton = ({
  text,
  onClick,
  disabled = false,
  add = true,
}: ResourceButtonProps) => {
  const { mode } = useColorScheme();

  return (
    <Box display="flex" margin={0.5}>
      <Box
        display="flex"
        borderRadius={5}
        padding={1}
        boxShadow={
          mode === 'dark'
            ? '0px 0px 3px rgba(255,255,255,0.2)'
            : '0px 0px 5px rgba(13, 13, 13, 0.24)'
        }
        sx={{
          cursor: disabled ? 'default' : 'pointer',
          opacity: disabled ? 0.5 : 1,
        }}
        onClick={() => {
          if (!disabled) {
            onClick();
          }
        }}
      >
        {add ? (
          <AddCircleOutlineIcon fontSize="small" color="success" />
        ) : (
          <DeleteIcon fontSize="small" color="error" />
        )}
        <Box width={5} />
        <Typography variant="body2">{text}</Typography>
      </Box>
    </Box>
  );
};

type SongItemProps = {
  item: Song;
  onEdit: () => void;
  retryItem: () => void;
  deleteItem: (() => void) | null;
  cancelItem: () => void;
  setAudio: (url: string | null) => void;
  audio: string | null;
  setVideo: (url: string | null) => void;
  isLoading: boolean;
};

const SongItem = ({
  item,
  onEdit,
  retryItem,
  deleteItem,
  cancelItem,
  setAudio,
  audio,
  setVideo,
  isLoading = false,
}: SongItemProps) => {
  const { browserLanguage } = GetBrowserLanguage();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteSingleSongDialog, setDeleteSingleSongDialog] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [songIDSelected, setSongIDSelected] = useState('');
  const [showPhotoVideoDialog, setShowPhotoVideoDialog] = useState(false);
  const [photoVideoAspectRatio, setPhotoVideoAspectRatio] = useState<
    'square' | 'portrait' | 'landscape' | 'wide'
  >('portrait');
  const [photoVideoDisplayLyrics, setPhotoVideoDisplayLyrics] = useState(true);
  const [images, setImages] = useState<Array<string>>([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const { mode } = useColorScheme();

  const actionButtons = (
    <Box marginBottom={1}>
      <Box display="flex" justifyContent="space-evenly">
        {item.status !== 'downloading' ? (
          <>
            <IconButton
              aria-label="retry"
              size="small"
              onClick={retryItem}
              color="default"
              disabled={isLoading || item.isLoading}
            >
              <SyncIcon fontSize="medium" />
            </IconButton>
          </>
        ) : null}
        {item.status === 'downloading' ? (
          <>
            <IconButton
              aria-label="retry"
              size="small"
              onClick={cancelItem}
              color="error"
              disabled={isLoading || item.isLoading}
            >
              <DoNotDisturbIcon fontSize="medium" />
            </IconButton>
          </>
        ) : null}
        <IconButton
          aria-label="edit"
          size="small"
          onClick={onEdit}
          color="default"
          disabled={isLoading || item.isLoading}
        >
          <ContentCopyIcon fontSize="medium" />
        </IconButton>
        {deleteItem !== null ? (
          <IconButton
            aria-label="delete"
            size="small"
            onClick={() => {
              if (!dialogOpen) {
                setDialogOpen(true);
              }
            }}
            color="error"
            disabled={isLoading || item.isLoading}
          >
            <DeleteIcon fontSize="medium" />
          </IconButton>
        ) : null}
      </Box>
    </Box>
  );

  return (
    <Box>
      <Paper elevation={2} style={{ overflow: 'hidden' }}>
        <Divisor />

        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box width={40} paddingLeft={1}>
            <IconButton
              aria-label="menu"
              size="small"
              onClick={() => setShowDetails(!showDetails)}
              color="default"
            >
              {showDetails ? (
                <CloseIcon fontSize="small" />
              ) : (
                <MenuIcon fontSize="small" />
              )}
            </IconButton>
          </Box>
          <Typography
            variant="subtitle1"
            textAlign="center"
            fontWeight="bold"
            noWrap={true}
          >
            {item.name}
          </Typography>
          <Box width={40} />
        </Box>
        <Divisor />
        <Divider />

        {showDetails ? (
          <>
            <Box display="flex" flexDirection="column" padding={1}>
              {item.songStyle || item.compiled_style ? (
                <Typography variant="body1">
                  <b>
                    {item.language === 'en'
                      ? 'Song style: '
                      : 'Estilo de la cancion: '}
                  </b>
                  {item.compiled_style ?? ''} {item.songStyle ?? ''}
                </Typography>
              ) : null}
              {item.llmSongStyle ? (
                <Typography variant="body1">
                  <b>
                    {item.language === 'en'
                      ? 'Boosted song style: '
                      : 'Estilo mejorado de la cancion: '}
                  </b>
                  {item.llmSongStyle}
                </Typography>
              ) : null}
              <Typography variant="body1">
                <b>ID:</b> {item.id}
              </Typography>
            </Box>
            <Divisor />
            <Divider />
          </>
        ) : null}

        <Box display="flex" flexDirection="column">
          {(item.status === 'error' || !item.status) && !item.retrying ? (
            <Box display="flex" flexDirection="column" padding={1}>
              <Typography variant="subtitle1" textAlign="center">
                {browserLanguage === 'en'
                  ? 'Error generating the song! 😿'
                  : 'Error creando la cancion! 😿'}
              </Typography>
              <Typography variant="body1" textAlign="center">
                {browserLanguage === 'en'
                  ? 'You can try again tho! 😺 Just click the 🔃 button below!'
                  : 'Lo puedes intentar de nuevo! 😺 Solo da click en el boton 🔃 abajo!'}
              </Typography>
            </Box>
          ) : null}

          {item.retrying ? (
            <Box display="flex" flexDirection="column" padding={1}>
              <Typography variant="subtitle1" textAlign="center">
                {browserLanguage === 'en'
                  ? 'Error generating the song! 😿'
                  : 'Error creando la cancion! 😿'}
              </Typography>
              <Typography variant="body1" textAlign="center">
                {browserLanguage === 'en'
                  ? "Server is a little busy right now! 😅 Your song will take a bit longer, but don't worry, we'll update this view as soon as we get the song ready, thanks!"
                  : 'El servidor esta muy ocupado en este momento! 😅 Tu cancion va a tardar un rato mas, pero no te preocupes, en cuanto este lista mostraremos las canciones aqui, gracias!'}
              </Typography>
            </Box>
          ) : null}

          {item.status === 'deleted' && !item.retrying ? (
            <Box display="flex" flexDirection="column" padding={1}>
              <Typography variant="subtitle1" textAlign="center">
                {browserLanguage === 'en'
                  ? 'Error generating the song! 😿'
                  : 'Error creando la cancion! 😿'}
              </Typography>
              <Typography variant="body1" textAlign="center">
                {browserLanguage === 'en'
                  ? 'You can try again tho! 😺 Just click the 🔃 button below!'
                  : 'Lo puedes intentar de nuevo! 😺 Solo da click en el boton 🔃 abajo!'}
              </Typography>
            </Box>
          ) : null}
          {item.status === 'maintenance' ? (
            <Box display="flex" flexDirection="column" padding={1}>
              <Typography variant="subtitle1" textAlign="center">
                {browserLanguage === 'en'
                  ? 'Error generating the song! 😿'
                  : 'Error creando la cancion! 😿'}
              </Typography>
              <Typography variant="body1" textAlign="center">
                {browserLanguage === 'en'
                  ? "Sorry, the service is currently under maintenance. We'll get it back up and running as soon as possible!"
                  : 'Lo sentimos, el serivicio esta actualmente bajo mantenimiento. Lo pondremos en linea lo antes posible!'}
              </Typography>
            </Box>
          ) : null}
          {item.status === 'downloading' ? (
            <Box display="flex" flexDirection="column" padding={1}>
              <Typography
                variant="subtitle1"
                textAlign="center"
                fontWeight="bold"
                noWrap={true}
              >
                {browserLanguage === 'en' ? 'Processing...' : 'Procesando...'}
              </Typography>
              <Box width="100%" marginTop={1}>
                <LinearProgress />
              </Box>
            </Box>
          ) : null}
        </Box>

        {item.songs?.map((i: APISong, index: number) => {
          return (
            <Box key={index} padding={1}>
              <Box display="flex" width="100%" marginBottom={2}>
                {i.appImageUrl ? (
                  <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                  >
                    <Box borderRadius={3} overflow="hidden">
                      <GenericImage
                        img_picture={`/media/${i.appImageUrl}`}
                        height={{ xs: 100 }}
                        width={{
                          xs: 110,
                        }}
                        unoptimized
                        fit="cover"
                      />
                    </Box>
                    <Link href={`/media/${i.appImageUrl}`} download>
                      <Box
                        display="flex"
                        borderRadius={5}
                        padding={1}
                        boxShadow={
                          mode === 'dark'
                            ? '0px 0px 3px rgba(255,255,255,0.2)'
                            : '0px 0px 5px rgba(13, 13, 13, 0.24)'
                        }
                        marginTop={1}
                        marginBottom={1}
                      >
                        <DownloadIcon fontSize="small" color="info" />
                        <Box width={5} />
                        <Typography variant="body2">
                          {item.language === 'en' ? 'Image' : 'Imagen'}
                        </Typography>
                      </Box>
                    </Link>
                  </Box>
                ) : null}
                <Box width={10} />
                {/* Players */}
                <Box display="flex" flexDirection="column" width="100%">
                  {i.appUrl ? (
                    <SongPlayer
                      onClick={() => {
                        setVideo(null);
                        setAudio(i.appUrl ? `/media/${i.appUrl}` : null);
                      }}
                      href={i.appUrl ? `/media/${i.appUrl}` : ''}
                      playing={audio === `/media/${i.appUrl}`}
                      mp3
                    />
                  ) : null}
                  {i.audioWavUrl ? (
                    <SongPlayer
                      onClick={() => {
                        setVideo(null);
                        setAudio(
                          i.audioWavUrl ? `/media/${i.audioWavUrl}` : null
                        );
                      }}
                      href={i.audioWavUrl ? `/media/${i.audioWavUrl}` : ''}
                      playing={audio === `/media/${i.audioWavUrl}`}
                      hd
                    />
                  ) : (
                    <ResourceButton
                      text={
                        item.language === 'en'
                          ? 'Generate HD Audio'
                          : 'Generar audio HD'
                      }
                      onClick={() => item.getWavSong(i.id)}
                      disabled={
                        item.isLoading ||
                        item.status === 'downloading' ||
                        (i.status === 'downloading' &&
                          i.audioWavTaskId !== undefined &&
                          i.audioWavTaskId !== '')
                      }
                      add
                    />
                  )}
                  {i.videoUrl ? (
                    <SongPlayer
                      onClick={() => {
                        setAudio(null);
                        setVideo(i.videoUrl ? `/media/${i.videoUrl}` : null);
                      }}
                      href={i.videoUrl ? `/media/${i.videoUrl}` : ''}
                      video
                    />
                  ) : (
                    <ResourceButton
                      text={
                        item.language === 'en'
                          ? 'Generate Lyrics Video'
                          : 'Generar video con letra'
                      }
                      onClick={() => item.getVideoSong(i.id)}
                      disabled={
                        item.isLoading ||
                        item.status === 'downloading' ||
                        (i.status === 'downloading' &&
                          i.videoTaskId !== undefined &&
                          i.videoTaskId !== '')
                      }
                      add
                    />
                  )}

                  {i.instrumentalUrl ? (
                    <SongPlayer
                      onClick={() => {
                        setVideo(null);
                        setAudio(
                          i.instrumentalUrl
                            ? `/media/${i.instrumentalUrl}`
                            : null
                        );
                      }}
                      href={
                        i.instrumentalUrl ? `/media/${i.instrumentalUrl}` : ''
                      }
                      karaoke
                    />
                  ) : (
                    <ResourceButton
                      text={
                        item.language === 'en'
                          ? 'Generate Karaoke'
                          : 'Generar Karaoke'
                      }
                      onClick={() => item.getKaraokeSong(i.id)}
                      disabled={
                        item.isLoading ||
                        item.status === 'downloading' ||
                        (i.status === 'downloading' &&
                          i.karaokeTaskId !== undefined &&
                          i.karaokeTaskId !== '')
                      }
                      add
                    />
                  )}
                  {i.vocalUrl ? (
                    <SongPlayer
                      onClick={() => {
                        setVideo(null);
                        setAudio(i.vocalUrl ? `/media/${i.vocalUrl}` : null);
                      }}
                      href={i.vocalUrl ? `/media/${i.vocalUrl}` : ''}
                      vocal
                    />
                  ) : null}

                  {i.karaokeVideoUrl ? (
                    <SongPlayer
                      onClick={() => {
                        setAudio(null);
                        setVideo(
                          i.karaokeVideoUrl
                            ? `/media/${i.karaokeVideoUrl}`
                            : null
                        );
                      }}
                      href={
                        i.karaokeVideoUrl ? `/media/${i.karaokeVideoUrl}` : ''
                      }
                      karaokeVideo
                    />
                  ) : i.vocalUrl && i.instrumentalUrl && i.videoUrl ? (
                    <ResourceButton
                      text={
                        item.language === 'en'
                          ? 'Generate Karaoke Video'
                          : 'Generar video karaoke'
                      }
                      onClick={() => item.getKaraokeVideoSong(i.id)}
                      disabled={item.isLoading || item.status === 'downloading'}
                      add
                    />
                  ) : null}

                  {i.photoVideoUrl ? (
                    <SongPlayer
                      onClick={() => {
                        setAudio(null);
                        setVideo(
                          i.photoVideoUrl ? `/media/${i.photoVideoUrl}` : null
                        );
                      }}
                      href={i.photoVideoUrl ? `/media/${i.photoVideoUrl}` : ''}
                      photoVideo
                    />
                  ) : null}

                  {i.appUrl ? (
                    <ResourceButton
                      text={
                        item.language === 'en'
                          ? 'Generate photo Video'
                          : 'Generar foto video'
                      }
                      onClick={() => {
                        setPhotoVideoAspectRatio('portrait');
                        setPhotoVideoDisplayLyrics(true);
                        setShowPhotoVideoDialog(true);
                        setSongIDSelected(i.id);
                      }}
                      disabled={item.isLoading || item.status === 'downloading'}
                      add
                    />
                  ) : null}

                  <ResourceButton
                    text={
                      item.language === 'en'
                        ? 'Delete this version'
                        : 'Eliminar esta version'
                    }
                    onClick={() => {
                      item.singleSongSelected = i.id;
                      setDeleteSingleSongDialog(true);
                    }}
                    disabled={item.isLoading || item.status === 'downloading'}
                    add={false}
                  />
                </Box>
              </Box>
              <Divider />
            </Box>
          );
        })}
        {actionButtons}
      </Paper>
      <Dialog
        language={item.language}
        onAgreed={() => {
          if (deleteItem !== null) {
            deleteItem();
          }
          setDialogOpen(false);
        }}
        onCancel={() => setDialogOpen(false)}
        open={dialogOpen}
        title={item.language === 'en' ? 'Delete song?' : 'Eliminar cancion'}
      >
        {item.language === 'en'
          ? 'Are you sure you want to delete this song?'
          : 'Estas serguro que deseas eliminar esta cacion?'}
      </Dialog>
      <Dialog
        language={item.language}
        onAgreed={() => {
          if (item.singleSongSelected) {
            item.deleteSingleSong(item.singleSongSelected);
          }
          setDeleteSingleSongDialog(false);
        }}
        onCancel={() => setDeleteSingleSongDialog(false)}
        open={deleteSingleSongDialog}
        title={item.language === 'en' ? 'Delete version?' : 'Eliminar version'}
      >
        {item.language === 'en'
          ? 'Are you sure you want to delete this version of the song?'
          : 'Estas serguro que deseas eliminar esta version de la cacion?'}
      </Dialog>
      {showPhotoVideoDialog ? (
        <Dialog
          language={item.language}
          onAgreed={() => {
            if (images.length > 2) {
              item.getPhotoVideoSong(
                songIDSelected,
                images,
                photoVideoAspectRatio,
                photoVideoDisplayLyrics
              );
            }
            setImages([]);
            setShowPhotoVideoDialog(false);
          }}
          onCancel={() => {
            setShowPhotoVideoDialog(false);
            setImages([]);
          }}
          open={showPhotoVideoDialog}
          title={
            item.language === 'en' ? 'Create photo video' : 'Crear foto video'
          }
        >
          <Box display="flex" flexDirection="column">
            <Typography variant="body2">
              {item.language === 'en'
                ? '1.- Select photos from your device, you must select at least 3 photos.'
                : '1.- Seleccione fotos desde su dispositivo, debe seleccionar al menos 3 fotos.'}
            </Typography>
            <Divisor />
            <Box width="100%" overflow="hidden">
              <input
                title="images"
                type="file"
                id="image"
                multiple={true}
                ref={input}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const promises: Array<Promise<string>> = [];
                  if (
                    e &&
                    e.target &&
                    e.target.files &&
                    e.target.files.length
                  ) {
                    const files = e.target.files as FileList;
                    // setImagesLoading(files.length);
                    for (let i = 0; i < files.length; i++) {
                      const file = e.target.files[i] as File;
                      promises.push(
                        new Promise((res, rej) => {
                          const reader = new FileReader();
                          reader.onload = (e: ProgressEvent<FileReader>) => {
                            if (e && e.target && e.target.result) {
                              const base64Image = e.target.result.toString();
                              resizeBase64Image(
                                base64Image,
                                1280,
                                1280,
                                0
                              ).then((rezisedImage) => res(rezisedImage));
                            } else {
                              return rej();
                            }
                          };
                          if (file) {
                            return reader.readAsDataURL(file);
                          }
                          return rej();
                        })
                      );
                    }
                    setLoadingImages(true);
                    Promise.all(promises)
                      .then((images: Array<string>) => {
                        setImages(images);
                        if (input && input.current) {
                          input.current.files = null;
                        }
                        setLoadingImages(false);
                      })
                      .catch((e) => console.log(e));
                  }
                }}
                accept="image/*"
                disabled={item.isLoading || item.status === 'downloading'}
              />
              {loadingImages ? (
                <Box width="100%" marginTop={1}>
                  <LinearProgress />
                </Box>
              ) : null}
            </Box>
            <Divisor />
            <Grid spacing={1} container>
              {images.map((i, index: number) => {
                return (
                  <Grid
                    key={index}
                    display="flex"
                    flexDirection="column"
                    justifyContent="end"
                    sx={{
                      background: `url(${i})`,
                      backgroundPosition: 'center',
                      backgroundSize: 'cover',
                    }}
                    height={120}
                    size={{ xs: 6, md: 4 }}
                  >
                    <Box
                      key={index}
                      display="flex"
                      justifyContent="space-between"
                      bgcolor="rgba(0, 0, 0, 0.37)"
                    >
                      <IconButton
                        aria-label="play"
                        size="medium"
                        onClick={() => {
                          const tmpImages = [...images];
                          const image = images[index] ?? '';
                          const imageLeft = images[index - 1] ?? '';
                          tmpImages[index - 1] = image;
                          tmpImages[index] = imageLeft;
                          setImages(tmpImages);
                        }}
                        disabled={index === 0}
                      >
                        <ArrowCircleLeftIcon fontSize="medium" />
                      </IconButton>

                      <IconButton
                        aria-label="play"
                        size="medium"
                        onClick={() => {
                          const tmpImages = [...images];
                          tmpImages.splice(index, 1);
                          setImages(tmpImages);
                        }}
                      >
                        <DeleteIcon fontSize="medium" color="error" />
                      </IconButton>

                      <IconButton
                        aria-label="play"
                        size="medium"
                        onClick={() => {
                          const tmpImages = [...images];
                          const image = images[index] ?? '';
                          const imageRight = images[index + 1] ?? '';
                          tmpImages[index + 1] = image;
                          tmpImages[index] = imageRight;
                          setImages(tmpImages);
                        }}
                        disabled={index === images.length - 1}
                      >
                        <ArrowCircleRightIcon fontSize="medium" />
                      </IconButton>
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
            <Divisor />
            <Typography variant="body2">
              {item.language === 'en' ? 'Video size' : 'Tamaño del video'}
            </Typography>
            <Box display="flex" justifyContent="space-between">
              <Box
                display="flex"
                flexDirection="column"
                justifyContent="center"
              >
                <IconButton
                  aria-label="play"
                  size="medium"
                  onClick={() => setPhotoVideoAspectRatio('square')}
                >
                  <CropSquareIcon
                    fontSize="medium"
                    color={
                      photoVideoAspectRatio === 'square' ? 'info' : 'inherit'
                    }
                  />
                </IconButton>
                <Typography variant="body2">
                  {item.language === 'en' ? 'Square' : 'Cuadro'}
                </Typography>
              </Box>
              <Box
                display="flex"
                flexDirection="column"
                justifyContent="center"
              >
                <IconButton
                  aria-label="play"
                  size="medium"
                  onClick={() => setPhotoVideoAspectRatio('portrait')}
                >
                  <CropPortraitIcon
                    fontSize="medium"
                    color={
                      photoVideoAspectRatio === 'portrait' ? 'info' : 'inherit'
                    }
                  />
                </IconButton>
                <Typography variant="body2">
                  {item.language === 'en' ? 'Portrait' : 'Vertical'}
                </Typography>
              </Box>
              <Box
                display="flex"
                flexDirection="column"
                justifyContent="center"
              >
                <IconButton
                  aria-label="play"
                  size="medium"
                  onClick={() => setPhotoVideoAspectRatio('landscape')}
                >
                  <CropLandscapeIcon
                    fontSize="medium"
                    color={
                      photoVideoAspectRatio === 'landscape' ? 'info' : 'inherit'
                    }
                  />
                </IconButton>
                <Typography variant="body2">
                  {item.language === 'en' ? 'Landscape' : 'Horizontal'}
                </Typography>
              </Box>
              <Box
                display="flex"
                flexDirection="column"
                justifyContent="center"
              >
                <IconButton
                  aria-label="play"
                  size="medium"
                  onClick={() => setPhotoVideoAspectRatio('wide')}
                >
                  <Crop169Icon
                    fontSize="medium"
                    color={
                      photoVideoAspectRatio === 'wide' ? 'info' : 'inherit'
                    }
                  />
                </IconButton>
                <Typography variant="body2">
                  {item.language === 'en' ? 'Wide 16:9' : 'Ancho 16:9'}
                </Typography>
              </Box>
            </Box>
            <Divisor />
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    value={photoVideoDisplayLyrics}
                    checked={photoVideoDisplayLyrics}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                      setPhotoVideoDisplayLyrics(event.target.checked)
                    }
                  />
                }
                label={
                  item.language === 'en'
                    ? 'Display lyrics in video'
                    : 'Mostrar letras en video'
                }
              />
            </FormGroup>
          </Box>
        </Dialog>
      ) : null}
    </Box>
  );
};

type Props = {
  items: Array<Song>;
  editItem: (song: Song) => void;
  retryItem: (song: Song) => void;
  deleteItem: ((id: string) => void) | null;
};

const GridOfSongs = ({ items, editItem, retryItem, deleteItem }: Props) => {
  const [audio, setAudio] = useState<string | null>(null);
  const [video, setVideo] = useState<string | null>(null);
  const { mode } = useColorScheme();

  useEffect(() => {
    const env = GetEnvVariables();
    document.body.style.backgroundColor =
      mode === 'dark' ? '#111' : (env.bodyBGColor ?? '#777');
  }, [mode]);

  return (
    <>
      <Grid container spacing={2}>
        {items.map((item: Song, index: number) => {
          return (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
              <SongItem
                item={item}
                onEdit={() => editItem(item)}
                retryItem={() => retryItem(item)}
                deleteItem={
                  deleteItem !== null ? () => deleteItem(item.id) : null
                }
                cancelItem={() => item.cancelItem()}
                isLoading={system.value.isLoading}
                setAudio={(url) => setAudio(url)}
                audio={audio}
                setVideo={(url) => setVideo(url)}
              />
            </Grid>
          );
        })}
      </Grid>
      {video ? (
        <Box
          position="fixed"
          width="100%"
          height={'100%'}
          left={0}
          top={0}
          zIndex={3}
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          <Box
            onClick={() => setVideo(null)}
            bgcolor="rgba(0,0,0,0.4)"
            position="fixed"
            width="100%"
            height={'100%'}
            left={0}
            top={0}
          />
          <Box
            width={{
              xs: 300,
              md: 400,
            }}
            zIndex={4}
            display="flex"
            flexDirection="column"
            // justifyContent="end"
          >
            <ReactPlayer
              src={video}
              width="100%"
              height="auto"
              playing={true}
              controls
            />
            <Box display="flex" justifyContent="end">
              <Box
                bgcolor="red"
                color="white"
                paddingLeft={1}
                display="flex"
                borderRadius="0 0 5px 5px"
                alignItems="center"
                sx={{ cursor: 'pointer' }}
                onClick={() => setVideo(null)}
              >
                <Typography variant="body2" color="white">
                  {/* {item.language === 'en' ? 'Close' : 'Cerrar'} */}
                  Cerrar
                </Typography>
                <IconButton aria-label="download" size="small">
                  <CloseIcon fontSize="small" htmlColor="white" />
                </IconButton>
              </Box>
            </Box>
          </Box>
        </Box>
      ) : null}
      {audio ? (
        <Box
          position="fixed"
          left={0}
          bottom={{
            xs: 0,
            sm: 60,
          }}
          width="100%"
          zIndex={1001}
        >
          <Box
            position="absolute"
            right={10}
            top={-30}
            bgcolor="red"
            color="white"
            paddingLeft={1}
            display="flex"
            borderRadius="5px 5px 0 0"
            alignItems="center"
            sx={{ cursor: 'pointer' }}
            onClick={() => setAudio(null)}
          >
            <Typography variant="body2" color="white">
              {/* {item.language === 'en' ? 'Close' : 'Cerrar'} */}
              Cerrar
            </Typography>
            <IconButton aria-label="download" size="small">
              <CloseIcon fontSize="small" htmlColor="white" />
            </IconButton>
          </Box>
          <AudioPlayer
            src={audio}
            customVolumeControls={[]}
            customAdditionalControls={[]}
            autoPlay
          />
        </Box>
      ) : null}
    </>
  );
};

export default GridOfSongs;
