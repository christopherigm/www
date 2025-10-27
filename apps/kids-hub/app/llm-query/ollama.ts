/* eslint-disable @typescript-eslint/no-explicit-any */
import { EmbedResponse, GenerateResponse, Ollama } from 'ollama';
import RandomNumber from '@repo/helpers/random-number';

type Models = {
  [string: string]: {
    host: string;
    name: string;
  };
};

export const models: Models = {
  gemma3: {
    host: 'http://192.168.0.24:11434',
    name: 'gemma3:latest',
  },
  gemma3PC: {
    host: 'http://192.168.0.28:11434',
    name: 'gemma3:12b',
  },
};

const ollamaQuery = (data: {
  host?: string;
  model?: string;
  prompt: string;
  images?: Array<string>;
  format?: any;
  reference?: string;
  embeddings?: Array<number>;
}): Promise<GenerateResponse> => {
  return new Promise((res, rej) => {
    const NODE_ENV = process.env.NODE_ENV ?? 'development';

    let system = 'You are an experienced and very skilled video analyst. ';
    system +=
      "Keep going until the job is completely solved before ending your turn. Use your tools, don't guess and don't hallucinate. Plan thoroughly before every tool call and reflect on the outcome after.";

    const {
      host = NODE_ENV === 'development'
        ? 'http://127.0.0.1:11434'
        : models.gemma3.host,
      model = models.gemma3.name,
      prompt,
      reference,
      embeddings = [],
    } = data;

    const ollama = new Ollama({ host });
    const ollamaPC = new Ollama({ host: models.gemma3PC.host });
    const promises: Array<Promise<boolean>> = [];
    promises.push(
      new Promise<boolean>((res) => {
        ollamaPC
          .ps()
          .then(() => res(true))
          .catch(() => res(false));
      })
    );
    promises.push(
      new Promise<boolean>((res) => {
        ollama
          .ps()
          .then(() => res(true))
          .catch(() => res(false));
      })
    );

    Promise.all(promises).then((values: Array<boolean>) => {
      let client: Ollama = ollama;
      let finalModel = model;

      if (values.length === 2 && values[0]) {
        client = ollamaPC;
        finalModel = models.gemma3PC.name;
      }

      if (reference) {
        client
          .embed({
            model: 'mxbai-embed-large',
            input: reference,
          })
          .then((value: EmbedResponse) => {
            // console.log(JSON.stringify(value));
            // const totalEmbeddings = [];
            // totalEmbeddings.push(embeddings);
            // totalEmbeddings.push(value.embeddings[0]);
            const totalEmbeddings = embeddings.concat(value.embeddings[0]);
            client
              .generate({
                model: finalModel,
                prompt: `Using this data: ${totalEmbeddings}. Respond to this prompt: ${prompt}`,
                stream: false,
                system,
                options: {
                  seed: RandomNumber(1, 9999),
                },
                think: 'high',
              })
              .then((value: GenerateResponse) => res(value))
              .catch((e) => rej(e));
          })
          .catch((e) => rej(e));
      } else {
        client
          .generate({
            model: finalModel,
            // prompt: `Using this data: ${embeddings}. Respond to this prompt: ${prompt}`,
            prompt,
            stream: false,
            system,
            options: {
              seed: RandomNumber(1, 999),
            },
            think: 'high',
          })
          .then((value: GenerateResponse) => res(value))
          .catch((e) => rej(e));
      }
    });
  });
};

export default ollamaQuery;
