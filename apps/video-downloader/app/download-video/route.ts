import { exec } from 'child_process';
import os from 'node:os';
import fs from 'fs';
import {
  winBinary,
  linuxBinary,
  ffmpegWinBinary,
  ffmpegLinuxBinary,
  cookies,
  mediaPath,
} from '@/config';
import { getOrCreateItem, updateItem } from '@/lib/item';
import getVideoName from '@/lib/get-video-name';
import type Item from '@/types/items';
import type DownloadOptions from '@/types/download-options';
import type Metadata from '@/types/metadata';
import isTidal from '@repo/helpers/is-tidal-checker';
import isTiktok from '@repo/helpers/is-tiktok-checker';
import isYoutube from '@repo/helpers/is-youtube-checker';
import isInstagram from '@repo/helpers/is-instagram-checker';
import type { NextRequest } from 'next/server';

const onData = (data: unknown) => {
  console.log('>>>', data);
};

const writeMetadataToFile = (
  item: Item,
  force: boolean = false
): Promise<Item> => {
  return new Promise((res, rej) => {
    if (
      !item.id ||
      !item.extention ||
      !fs.existsSync(`${mediaPath}/${item.id}.${item.extention}`)
    ) {
      console.log('No tiem', item);
      return rej('No item');
    }
    console.log('>>> writeMetadataToFile -> Item:', item);
    if (fs.existsSync(`${mediaPath}/${item.filename}`) && !force) {
      item.status = 'ready';
      return updateItem(item)
        .catch((error) => rej(error))
        .finally(() => res(item));
    }
    if (item.justAudio) {
      item.filename = `${item.name}.${item.extention}`;
      if (
        (item.artist === 'NA' ||
          item.artist === undefined ||
          item.artist === 'undefined' ||
          force) &&
        item.name &&
        item.name.indexOf(' - ') > -1 &&
        item.name.split(' - ').length > 1
      ) {
        const arrayName = item.name.split(' - ');
        item.name = arrayName[arrayName.length - 1] ?? item.name;
        item.artist = arrayName[0];
        item.albumArtist = arrayName[0];
        item.filename = `${item.name}.${item.extention}`;
      }
    } else {
      item.filename = `${item.name}-${item.id}.${item.extention}`;
    }
    console.log('>>> writeMetadataToFile -> Item (final):', item);

    if ((isTiktok(item.url || '') && item.hdTikTok) || item.FPS60) {
      item.status = 'processing-h264';
    }
    updateItem(item)
      .finally(() => {
        let command = '';
        if (item.justAudio) {
          command +=
            os.platform() === 'win32' ? ffmpegWinBinary : ffmpegLinuxBinary;
          command += ` -i "${mediaPath}/${item.id}.${item.extention}" `;
          command += '-vn -acodec copy -y ';
          command += `-metadata title="${item.name}" `;
          command += `-metadata artist="${item.artist}" `;
          command += `-metadata album_artist="${item.albumArtist}" `;
          command += `-metadata album="${item.album}" `;
          command += `"${mediaPath}/${item.filename}" `;
          command += `&& rm "${mediaPath}/${item.id}.${item.extention}" `;
          if (os.platform() === 'win32') {
            command += `&& cp "${mediaPath}/${item.filename}" public/media`;
          }
          exec(command, (error) => {
            if (error) {
              console.log('exec error', error);
              return rej(error);
            }
            res(item);
          }).stdout?.on('data', onData);
        } else {
          if (isTiktok(item.url || '') && item.hdTikTok) {
            command +=
              os.platform() === 'win32' ? ffmpegWinBinary : ffmpegLinuxBinary;
            command += ` -i "${mediaPath}/${item.id}.${item.extention}" -map 0 -c:v libx264 -crf 25 -c:a copy "${mediaPath}/${item.filename}" -loglevel verbose `;
            command += ` && rm -rf "${mediaPath}/${item.id}.${item.extention}" `;
          } else {
            command += ` mv "${mediaPath}/${item.id}.${item.extention}" "${mediaPath}/${item.filename}" `;
          }
          if (item.FPS60) {
            command += ` && mv "${mediaPath}/${item.filename}" "${mediaPath}/tmp-${item.filename}" && `;
            command +=
              os.platform() === 'win32' ? ffmpegWinBinary : ffmpegLinuxBinary;
            command += ` -i "${mediaPath}/tmp-${item.filename}" -filter:v minterpolate -r 60 "${mediaPath}/${item.filename}"`;
            command += ` && rm "${mediaPath}/tmp-${item.filename}" `;
          }
          if (os.platform() === 'win32') {
            command += ` && cp "${mediaPath}/${item.filename}" public/media `;
          }
          console.log('Final Command:', command);
          exec(command, (error) => {
            if (error) {
              console.log('Final Command [error]:', error);
              return rej(error);
            }
            console.log('Final Command [done]:', item);
            res(item);
          }).stdout?.on('data', onData);
        }
      })
      .catch((e) => console.log('error', e));
  });
};

const downloadVideo = (
  url: string,
  options: DownloadOptions,
  metadata: Metadata
): Promise<Item> => {
  return new Promise((res, rej) => {
    getOrCreateItem({
      url,
      justAudio: options.justAudio,
      hdTikTok: options.hdTikTok,
    })
      .then((i: Item) => {
        const item = { ...i };
        console.log('>>> downloadVideo (getOrCreateItem):', item);
        if (
          item.filename &&
          fs.existsSync(`${mediaPath}/${item.filename}`) &&
          item.status === 'ready' &&
          item.justAudio === options.justAudio &&
          !options.force
        ) {
          console.log('First catch');
          item.created = new Date();
          updateItem(item)
            .then((item) => res(item))
            .catch((e) => rej(e));
        } else if (
          item.filename &&
          fs.existsSync(`${mediaPath}/${item.filename}`) &&
          item.status === 'downloading' &&
          !options.force
        ) {
          console.log('First and half catch');
          item.status = 'ready';
          item.created = new Date();
          delete item.error;
          updateItem(item)
            .then((item) => res(item))
            .catch((e) => rej(e));
        } else if (
          fs.existsSync(`${mediaPath}/${item.id}.${item.extention}`) &&
          !fs.existsSync(`${mediaPath}/${item.filename}`) &&
          !options.force
        ) {
          console.log('Second catch');
          writeMetadataToFile(item, options.force)
            .then((item) => {
              item.status = 'ready';
              item.created = new Date();
              delete item.error;
              updateItem(item)
                .then((item) => res(item))
                .catch((e) => rej(e));
            })
            .catch((e) => rej(e));
        } else if (
          fs.existsSync(`${mediaPath}/${item.filename}`) &&
          !options.force
        ) {
          console.log('Third catch');
          item.status = 'ready';
          delete item.error;
          updateItem(item)
            .then((item) => res(item))
            .catch((e) => rej(e));
        } else {
          console.log('Final catch');
          if (isTiktok(url)) {
            url += '?is_from_webapp=1&sender_device=pc';
          }
          const iOS =
            metadata &&
            metadata.userAgent &&
            (metadata.userAgent.indexOf('iPad') > -1 ||
              metadata.userAgent.indexOf('iPhone') > -1);
          let command =
            os.platform() === 'win32'
              ? `${winBinary} "${url}" `
              : `${linuxBinary} "${url}" `;
          if (isYoutube(url) && !iOS) {
            command += `-f "${
              options.justAudio ? '' : 'bestvideo[ext=mp4]+'
            }bestaudio[ext=m4a]/${
              options.justAudio ? '' : 'bestvideo+'
            }bestaudio" `;
          } else {
            command += `--add-header "user-agent:Mozilla/5.0" -vU `;
          }
          if (isYoutube(url)) {
            command += ' --no-playlist ';
          }
          if (isInstagram(url) || iOS || (isTiktok(url) && !item.hdTikTok)) {
            command += ' -S "codec:h264" ';
          }
          if (isInstagram(url)) {
            command += ' --no-abort-on-error --no-playlist ';
          }
          if (os.platform() !== 'win32') {
            command += ` --cookies ${cookies} `;
          }
          // command += '--write-sub --write-auto-sub --sub-lang "en.*" ';
          if (!options.justAudio) {
            command += ' --merge-output-format mp4 ';
          }
          command += ` -o "${mediaPath}/${item.id}.%(ext)s"`;
          command += ' --quiet ';
          console.log('command:', command);
          item.remoteAddress = metadata.remoteAddress;
          item.justAudio = options.justAudio;
          item.status = 'downloading';
          item.error = '';
          item.created = new Date();
          item.extention = options.justAudio ? 'm4a' : 'mp4';
          item.nodeName = process.env.NODE_NAME || 'unknown';
          // delete item.error;
          updateItem(item)
            .then((item) => {
              res(item);
              exec(command, { maxBuffer: 1024 * 2048 }, (error) => {
                const fileExist =
                  item.id &&
                  item.extention &&
                  fs.existsSync(`${mediaPath}/${item.id}.${item.extention}`);
                console.log('>> download fileExist:', fileExist);
                if (error && !fileExist) {
                  console.log('>> download error:', error);
                  const videoDeleted =
                    error.toString().search('Video not available') > -1;
                  console.log('>> videoDeleted:', videoDeleted);
                  item.status = videoDeleted ? 'deleted' : 'error';
                  item.error = String(error);
                  item.completed = new Date();
                  updateItem(item).catch((e) =>
                    console.log('>>> updateItem error:', e)
                  );
                } else {
                  console.log('>>> downloadVideo (done):', item);
                  writeMetadataToFile(item, options.force)
                    .then((item) => {
                      item.status = 'ready';
                      item.completed = new Date();
                      delete item.error;
                      updateItem(item)
                        .then(() => console.log('>>> Item COMPLETE:', item))
                        .catch((e) => console.log('>>> updateItem error:', e));
                    })
                    .catch((e) => {
                      console.log('??? writeMetadataToFile error:', e);
                      item.status = 'error';
                      item.error = e;
                      item.completed = new Date();
                      updateItem(item).catch((e) =>
                        console.log('>>> updateItem error:', e)
                      );
                    });
                }
              }).stdout?.on('data', onData);
            })
            .catch((e) => rej(e));
        }
      })
      .catch((error) => rej(error));
  });
};

const downloadMusic = (
  url: string,
  metadata: Metadata,
  folder?: string
): Promise<Item> => {
  return new Promise((res, rej) => {
    getOrCreateItem({ url })
      .then((i: Item) => {
        const item = { ...i };
        console.log('>>> download music (getOrCreateItem):', item);
        const command = `tidal-dl -l ${url}${
          folder ? ` -o /app/users/${folder}/music` : ''
        }`;
        console.log('command:', command);
        item.remoteAddress = metadata.remoteAddress;
        item.status = 'downloading';
        item.created = new Date();
        item.extention = 'flac';
        item.nodeName = process.env.NODE_NAME || 'unknown';
        delete item.error;
        updateItem(item)
          .then((item) => {
            res(item);
            exec(command, { maxBuffer: 1024 * 2048 }, (error) => {
              if (error) {
                console.log('>> download music error:', error);
                item.status = 'error';
                item.error = String(error);
                item.completed = new Date();
                updateItem(item).catch((e) =>
                  console.log('>>> updateItem error:', e)
                );
              } else {
                console.log('>>> download music (done):', item);
                item.status = 'ready';
                item.completed = new Date();
                delete item.error;
                updateItem(item)
                  .then(() => console.log('>>> Item music COMPLETE:', item))
                  .catch((e) => console.log('>>> updateItem music error:', e));
              }
            }).stdout?.on('data', onData);
          })
          .catch((e) => rej(e));
      })
      .catch((e) => rej(e));
  });
};

export async function POST(req: NextRequest) {
  const body = await req.json();
  console.log('>>> body:', body);

  const url = body?.url ?? null;
  if (!url) {
    return Response.json(
      {
        id: '',
        status: 'error',
        url: '',
        error: 'No url provided',
      },
      {
        status: 400,
      }
    );
  }
  const justAudio = body?.justAudio ?? false;
  const FPS60 = body?.FPS60 ?? false;
  const hdTikTok = body?.hdTikTok !== undefined ? body.hdTikTok : false;
  const force = body?.force ?? false;
  const options: DownloadOptions = {
    justAudio,
    hdTikTok,
    FPS60,
    force,
  };
  const userAgent = req.headers.get('user-agent') ?? '';
  const ipAddress =
    req.headers.get('x-real-ip') ?? req.headers.get('x-forwarded-for') ?? '';
  const metadata: Metadata = {
    remoteAddress: ipAddress,
    userAgent,
  };
  console.log('>>> metadata:', metadata);
  if (isTidal(url)) {
    const folder = body?.userFolder ?? '';
    return downloadMusic(url, metadata, folder)
      .then((item) =>
        Response.json(item, {
          status: 201,
        })
      )
      .catch((error) =>
        Response.json(error.toString(), {
          status: 400,
        })
      );
  } else {
    return getVideoName(url, justAudio, hdTikTok, FPS60, force)
      .then((item: Item) => {
        const newURL = item.url || url;
        downloadVideo(newURL, options, metadata)
          .then(() => console.log('downloadVideo request processing'))
          .catch((e) => {
            console.log('downloadVideo error:', e);
            item.status = 'error';
            item.completed = new Date();
            updateItem(item).catch((e) => console.log(e));
          });
        return updateItem({ ...item, status: 'downloading' })
          .then((item) =>
            Response.json(item, {
              status: 201,
            })
          )
          .catch((error) =>
            Response.json(error.toString(), {
              status: 400,
            })
          );
      })
      .catch((error) =>
        Response.json(error.toString(), {
          status: 400,
        })
      );
  }
}
