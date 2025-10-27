import { ObjectId } from 'mongodb';

export type TimestampedLyrics = Array<{
  word: string;
  success: boolean;
  startS: number;
  endS: number;
  palign: number;
}>;

export type APISong = {
  id: string;
  taskID?: string;
  audioUrl: string;
  appUrl?: string;
  appImageUrl?: string;
  sourceAudioUrl: string;
  streamAudioUrl: string;
  sourceStreamAudioUrl: string;
  imageUrl: string;
  sourceImageUrl: string;
  // Post-Processing status
  status?: string;
  // WAV file
  audioWavTaskId?: string;
  audioWavUrl?: string;
  // Lyrics Video
  videoTaskId?: string;
  videoUrl?: string;
  // Karaoke tracks
  karaokeTaskId?: string;
  instrumentalUrl?: string;
  vocalUrl?: string;
  karaokeVideoUrl?: string;
  // photo video
  timestampedLyrics?: TimestampedLyrics;
  photoVideoUrl?: string;
};

type Song = {
  _id?: ObjectId;
  id?: string;
  taskID?: string;

  name?: string;
  prompt?: string;
  llmLyrics?: string;
  lyricsStyle?: string;
  songStyle?: string;
  compiledStyle?: string;
  llmSongStyle?: string;
  songStyleBoost?: boolean;
  model?: string;
  instrumental?: boolean;

  status?:
    | 'none'
    | 'downloading'
    | 'ready'
    | 'error'
    | 'deleted'
    | 'canceled'
    | 'maintenance';
  error?: string;
  created?: Date;
  retrying?: boolean;

  llmStatus?: string;
  llmErrorCode?: number;

  songs?: Array<APISong>;

  completed?: Date;

  remoteAddress?: string;
  nodeName?: string;
};

export default Song;
