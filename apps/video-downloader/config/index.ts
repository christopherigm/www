const nodeEnv = process.env.NODE_ENV?.trim() ?? 'localhost';

export const winBinary = 'yt-dlp-win.exe';
export const linuxBinary = nodeEnv == 'production' ? '/app/yt-dlp' : './yt-dlp';
export const cookies =
  nodeEnv == 'production'
    ? '/app/netscape-cookies.txt'
    : './netscape-cookies.txt';
export const ffmpegWinBinary = 'ffmpeg.exe';
export const ffmpegLinuxBinary = 'ffmpeg';
export const mediaPath =
  nodeEnv == 'production' ? '/app/media' : 'public/media';
export const MONGO_DB = 'vd';
export const MONGO_DB_ITEM_COLLECTION = 'items';
export const MONGO_DB_SONG_COLLECTION = 'songs';
