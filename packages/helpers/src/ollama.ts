/* eslint-disable @typescript-eslint/no-explicit-any */
import { EmbedResponse, GenerateResponse, Ollama } from 'ollama';
import RandomNumber from '@repo/helpers/random-number';

// Create a fetch function with custom timeout
// https://github.com/ollama/ollama-js/issues/72
const fetchWithTimeout = (url: string, init: any = {}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 92000000); // 10 minutes

  return fetch(url, {
    ...init,
    signal: controller.signal,
  }).finally(() => clearTimeout(timeoutId));
};

/*
Chat with history
https://github.com/ollama/ollama-python/blob/main/examples/chat-with-history.py

*/

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
    host: 'http://192.168.0.24:11434', // 'http://192.168.0.28:11434',
    name: 'gemma3:latest',
  },
};

const OllamaQuery = (data: {
  host?: string;
  model?: string;
  prompt: string;
  system?: string;
  images?: Array<string>;
  format?: any;
  stringContext?: string;
  embeddings?: Array<number>;
}): Promise<GenerateResponse> => {
  return new Promise((res, rej) => {
    const NODE_ENV = process.env.NODE_ENV ?? 'development';
    const {
      host = NODE_ENV === 'development'
        ? 'http://127.0.0.1:11434'
        : (models?.gemma3?.host ?? ''),
      model = models?.gemma3?.name ?? '',
      prompt,
      system = '',
      format,
      stringContext,
      embeddings = [],
    } = data;

    const ollama = new Ollama({ host, fetch: fetchWithTimeout as any });
    const ollamaPC = new Ollama({
      host: models?.gemma3PC?.host ?? '',
      fetch: fetchWithTimeout as any,
    });
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
        finalModel = models?.gemma3PC?.name ?? '';
      }

      if (stringContext) {
        client
          .embed({
            model: 'mxbai-embed-large',
            input: stringContext,
          })
          .then((value: EmbedResponse) => {
            // console.log(JSON.stringify(value));
            // const totalEmbeddings = [];
            // totalEmbeddings.push(embeddings);
            // totalEmbeddings.push(value.embeddings[0]);
            const totalEmbeddings = embeddings.concat(
              value.embeddings[0] ?? []
            );
            // console.log(JSON.stringify(value));
            client
              .generate({
                model: finalModel,
                context: totalEmbeddings,
                prompt,
                // prompt: `Using this data: ${totalEmbeddings}. Respond to this prompt: ${prompt}`,
                stream: false,
                system,
                format,
                options: {
                  seed: RandomNumber(1, 9999),
                },
                think: 'high',
                keep_alive: -1,
              })
              .then((value: GenerateResponse) => res(value))
              .catch((e) => {
                console.log('Ollama generate error', e);
                rej(e);
              });
          })
          .catch((e) => rej(e));
      } else {
        // client.chat({
        //   model: finalModel,
        //   messages: [],
        //   // tools: [webSearchTool, webFetchTool],
        //   stream: true,
        //   think: true,
        //   format,
        //   options: {
        //     low_vram: true
        //   }
        // })
        client
          .generate({
            model: finalModel,
            prompt,
            stream: false,
            system,
            format,
            options: {
              seed: RandomNumber(1, 999),
              // num_ctx: 1000,
              // temperature: 1.5,
              // repeat_penalty: 1.2,
              // top_k: 500,
              // top_p: 1,
            },
            think: 'high',
            keep_alive: -1,
          })
          .then((value: GenerateResponse) => res(value))
          .catch((e) => rej(e));
      }
    });
  });
};

export default OllamaQuery;
