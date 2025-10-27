import { exec } from 'child_process';
import os from 'node:os';
import { winBinary, linuxBinary, cookies } from '@/config';
import { getOrCreateItem, updateItem } from '@/lib/item';
import type Item from '@/types/items';
import isInstagram from '@repo/helpers/is-instagram-checker';
import isX from '@repo/helpers/is-x-checker';
import isYoutube from '@repo/helpers/is-youtube-checker';
import getFinalURL from '@repo/helpers/get-final-url';

const onData = () => {
  // console.log('>>> [onData]:', data);
};

const getArrayOfParenthesis = (
  name: string,
  a: Array<string> = []
): Array<string> => {
  const initialBracket = name.search(/\(|\[/);
  const finalBracket = name.search(/\)|\]/);
  if (initialBracket > -1 && finalBracket > -1) {
    const wordsInParenthesis = name.substring(initialBracket, finalBracket + 1);
    a.push(wordsInParenthesis);
    name =
      name.slice(0, initialBracket - 1) +
      name.slice(finalBracket + 1, name.length);
    name = name.trim();
    return getArrayOfParenthesis(name, a);
  } else {
    a.unshift(name);
  }
  return a;
};

const cleanName = (n: string): string => {
  if (!n || n === 'NA') {
    return n;
  }
  // console.log('>>> cleanName before:', n);
  let name = n
    .replace(/\n/g, '')
    .replace(/https\:\/\//g, '')
    .replace(/\//g, '')
    .replace(/\./g, '')
    .replace(/\,/g, '')
    .replace(/\$/g, '')
    .replace(/\%/g, '')
    .replace(/\@/g, '')
    .replace(/\#/g, '')
    .replace(/\?/g, '')
    .replace(/\"/g, '')
    .replace(/\u2013|\u2014/g, '-')
    .replace(/(?:https?|ftp):\/\/[\n\S]+/g, '');
  // console.log('>>> cleanName name:', name);
  const items = getArrayOfParenthesis(name);
  // console.log('>>> cleanName items:', items);
  name = items.shift() || '';
  // console.log('>>> cleanName name 2:', name);
  items.forEach((i: string, index: number) => {
    const remove =
      i
        .toLowerCase()
        .search(
          /lyric|lyrics|official|oficial|letra|letras|video|hd|hq|audio/
        ) > -1;
    if (remove) {
      items.splice(index, 1);
    }
  });
  if (items.length) {
    name = name + ' ' + items.join(' ');
  }
  return name;
};

const getVideoName = (
  url: string,
  justAudio: boolean = false,
  hdTikTok: boolean = false,
  FPS60: boolean = false,
  force: boolean = false
): Promise<Item> => {
  return new Promise(async (res, rej) => {
    let URL = url;
    if (isX(url)) {
      URL = URL.replaceAll('x.com', 'twitter.com');
    }
    if (isInstagram(url)) {
      URL = await getFinalURL(url);
    }
    console.log('>>>> getVideoName Date:', new Date(Date.now()));
    getOrCreateItem({ url: URL, justAudio, hdTikTok, FPS60 })
      .then((i: Item) => {
        const item = { ...i };
        console.log('>>> getOrCreateItem -> Item:', item);
        if (item.name && !force) {
          return res(item);
        }
        const dataToPrint =
          isYoutube(url) && justAudio
            ? '%(title)s:-:%(artist)s:-:%(album)s:-:%(album_artist)s'
            : '%(title)s';
        let command =
          os.platform() === 'win32'
            ? `${winBinary} "${URL}" --print "${dataToPrint}"`
            : `${linuxBinary} "${URL}" --print "${dataToPrint}"`;
        if (os.platform() !== 'win32') {
          command += ` --cookies ${cookies} `;
        }
        if (isYoutube(URL)) {
          command += ' --no-playlist ';
        }
        if (isInstagram(url)) {
          command += ' --no-abort-on-error --no-playlist ';
        }
        exec(command, (err, videoName: string) => {
          if (err) {
            console.log('Error, getVideoName:', err);
            videoName = url;
          }
          console.log('>>> VideoName:', videoName);
          let fileName = cleanName(videoName);
          console.log('>>> fileName:', fileName);
          if (fileName.split(':-:').length) {
            fileName = cleanName(fileName);
            const [rawName, artist, album, albumArtist] = fileName.split(':-:');
            let name = rawName;
            name = name.replace(/  /g, ' ');
            if (name.length > 128) {
              name = name.slice(0, 128);
            }
            if (name[name.length - 1] === ' ') {
              name = name.slice(0, name.length - 1);
            }
            item.name = name;
            if (album && album !== 'NA') {
              item.album = album;
            }
            if (
              (artist && artist !== 'NA') ||
              (albumArtist && albumArtist !== 'NA')
            ) {
              item.artist = artist;
              item.albumArtist = albumArtist === 'NA' ? artist : albumArtist;
            }
          } else if (fileName) {
            item.name = fileName;
          } else {
            item.name = item.id || url;
          }
          console.log('>>> getOrCreateItem -> Item (final):', item);
          updateItem(item)
            .catch((error) => rej(error))
            .finally(() => res(item));
        }).stdout?.on('data', onData);
      })
      .catch((error) => rej(error.toString()));
  });
};

export default getVideoName;
