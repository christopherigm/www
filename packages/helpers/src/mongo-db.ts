import { MongoClient, Db } from 'mongodb';

const MONGO_URI = process.env.MONGO_URI ?? 'mongodb://127.0.0.1:27017/';

const client = new MongoClient(MONGO_URI);

export const dbOpenConnection = (MONGO_DB: string): Promise<Db> => {
  return new Promise((res, rej) => {
    client
      .connect()
      .then((client) => res(client.db(MONGO_DB)))
      .catch((error) => rej(error));
  });
};

export const dbCloseConnection = () => client.close();
