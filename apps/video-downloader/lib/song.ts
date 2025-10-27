import { dbOpenConnection } from '@repo/helpers/mongo-db';
import { MONGO_DB_SONG_COLLECTION } from '@/config';
import type Song from '@/types/song';
import { ObjectId } from 'mongodb';
import type { Document } from 'mongodb';
import { MONGO_DB } from '@/config';

export const getAllSongs = (query: Song): Promise<Array<Document>> => {
  return new Promise((res, rej) => {
    return dbOpenConnection(MONGO_DB)
      .then(async (db) => {
        const collection = db.collection(MONGO_DB_SONG_COLLECTION);
        const items = await collection.find(query);
        return res(items.toArray() ?? []);
      })
      .catch((error) => rej(error));
  });
};

export const getOrCreateSong = (item: Song): Promise<Song> => {
  return new Promise((res, rej) => {
    return getSong(item)
      .then((i) => {
        // console.log('>>> getOrCreateSong:', i);
        if (i) {
          return res(i);
        }
        createSong(item)
          .then((id) => getSong({ ...item, id }))
          .then((i) => {
            if (i) {
              // console.log('>>> getOrCreateSong new song ID', i._id);
              return res(i);
            }
            rej('Error creating song');
          })
          .catch((error) => rej(error));
      })
      .catch((error) => rej(error));
  });
};

export const getSongByTaskID = (taskID: string): Promise<Song | null> => {
  return new Promise((res, rej) => {
    return getSong({ taskID })
      .then((song) => {
        console.log('>>> getSongByTaskID:', song);
        res(song);
      })
      .catch((error) => rej(error));
  });
};

export const createSong = (item: Song): Promise<string> => {
  return new Promise((res, rej) => {
    return dbOpenConnection(MONGO_DB)
      .then((db) => {
        const collection = db.collection(MONGO_DB_SONG_COLLECTION);
        const newItem = { ...item };
        newItem.created = new Date();
        collection
          .insertOne(newItem)
          .then((data) => {
            const id = data.insertedId.toString();
            // console.log('>>> createSong new id:', id);
            res(id);
          })
          .catch((error) => rej(error));
      })
      .catch((error) => rej(error));
  });
};

export const getSong = (song: Song): Promise<Song | null> => {
  return new Promise((res, rej) => {
    return dbOpenConnection(MONGO_DB)
      .then(async (db) => {
        const collection = db.collection(MONGO_DB_SONG_COLLECTION);
        // console.log('>>> getSong song', song.id, song.taskID);
        if (song._id || song.id || song.taskID) {
          const query = {
            _id: new ObjectId(song.id || song._id),
            ...(song.taskID && { taskID: song.taskID }),
          };
          // console.log('>>> getSong query', query);
          const item: Document | null = await collection.findOne(query);
          if (item) {
            const i: Song = {
              id: item._id.toString(),
              ...item,
            };
            // console.log('>>> getSong item - i:', i.id, i.name, i.taskID);
            delete i.remoteAddress;
            return res(i as Song);
          }
        } else {
          return res(null);
        }
      })
      .catch((error) => rej(error));
  });
};

export const deleteSong = (song: Song): Promise<void> => {
  return new Promise((res, rej) => {
    return dbOpenConnection(MONGO_DB)
      .then(async (db) => {
        const collection = db.collection(MONGO_DB_SONG_COLLECTION);
        if (song._id || song.id) {
          const query = { _id: new ObjectId(song.id || song._id) };
          await collection.deleteOne(query);
          res();
        } else {
          return res();
        }
      })
      .catch((error) => rej(error));
  });
};

export const updateSong = (item: Song): Promise<Song> => {
  return new Promise((res, rej) => {
    dbOpenConnection(MONGO_DB)
      .then((db) => {
        const collection = db.collection(MONGO_DB_SONG_COLLECTION);
        const newItem = { ...item };
        delete newItem._id;
        collection
          .updateOne({ _id: new ObjectId(item.id) }, { $set: newItem })
          .then(() => res(newItem))
          .catch((error) => rej(error));
      })
      .catch((error) => rej(error));
  });
};
