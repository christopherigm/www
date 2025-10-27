/* eslint-disable @typescript-eslint/no-explicit-any */
// https://www.geeksforgeeks.org/how-to-setup-a-typescript-project/
import { Telegraf } from 'telegraf';
import { message } from 'telegraf/filters';
import { GenerateResponse, Ollama } from 'ollama';
import https from 'https';
import fs from 'fs';

const getImage = (token: string, id: string): Promise<string> => {
  return new Promise((res, rej) => {
    const url = `https://api.telegram.org/bot${token}/getFile?file_id=${id}`;
    fetch(url)
      .then((response) => {
        response
          .json()
          .then((data: any) => {
            const file_path = data.result.file_path;
            const url = `https://api.telegram.org/file/bot${token}/${file_path}`;
            const file = fs.createWriteStream(`./${file_path}`);
            https.get(url, function (response) {
              response.pipe(file);
              file.on('finish', () => {
                file.close();
                res(`./${file_path}`);
              });
            });
          })
          .catch((e) => console.log('Error:', e));
      })
      .catch((e) => console.log('Error:', e));
  });
};

const ollamaQuery = (data: {
  host: string;
  model: string;
  prompt: string;
  images: Array<string>;
  format: any;
}): Promise<string> => {
  return new Promise((res, rej) => {
    const { host, model, prompt, images, format } = data;
    const ollama = new Ollama({ host });
    ollama
      .generate({
        model,
        prompt,
        images,
        format,
        stream: false,
      })
      .then((value: GenerateResponse) => res(value.response ?? ''))
      .catch((e) => rej(e));
  });
};

type ModelNames = 'llama3' | 'deepseek' | 'llava7' | 'llava';
type Models = {
  [string: string]: {
    host: string;
    name: string;
  };
};
type Response = {
  rate: number;
  category: string;
  description: string;
  hashtags: string;
};
type Languages = 'en' | 'es';
type ChatConfig = {
  [id: string]: {
    language: Languages;
  };
};

const models: Models = {
  llama3: {
    host: 'http://192.168.0.52:11434',
    name: 'llama3.2:latest',
  },
  deepseek: {
    host: 'http://192.168.0.52:11434',
    name: 'deepseek-r1:8b',
  },
  llava: {
    host: 'http://192.168.0.52:11434',
    name: 'llava:7b',
  },
  llava7: {
    host: 'http://192.168.0.52:11434',
    name: 'llava:7b',
  },
};

let modelSelected: ModelNames = 'llava';
const chatConfigs: ChatConfig = {};
const token = process.env.BOT_TOKEN ?? '';
const bot = new Telegraf(token);

bot.command('quit', async (ctx) => {
  await ctx.telegram.leaveChat(ctx.message.chat.id);
  await ctx.leaveChat();
});

bot.on(message('photo'), async (ctx) => {
  const userID = ctx.update.message.from.id.toString();
  if (!(userID in chatConfigs)) {
    chatConfigs[userID] = {
      language: 'en',
    };
  }

  const photos = ctx.update.message.photo ?? [];
  const id = photos[photos.length - 1]?.file_id ?? '';

  if (chatConfigs[userID].language === 'en') {
    await ctx.reply(
      "Alright, give me a moment please... (I'll send you a message once done, I might be slow to respond 😊)."
    );
  } else {
    await ctx.reply(
      'Muy bien, dame un momento por favor... (Te enviare un mensaje cuando termine, quiza me tarde un poco 😊).'
    );
  }

  let prompt = '';
  // if (chatConfigs[userID].language === 'en') {
  prompt = 'Classify this picture in one of the following categories: ';
  prompt +=
    'meme, landscape, people, animal, car, tools, art, food, plants, portrait. ';
  prompt +=
    'Then, rate the image on a scale from 1 to 10 according to its category. ';
  prompt += 'Then generate 3 hashtags for the image in a single text. ';
  prompt +=
    'If there is any text or title in the image, or above or below, it should be used to generate the description. ';
  prompt +=
    'If there are characters in the image, try to identify them by name and include it in the description. ';
  prompt += 'Description must be at least 20 words long. ';
  prompt += 'Description MUST not contain: ';
  prompt += 'hate speech or violent threats. ';
  prompt +=
    'Respond just with: category, rate, hashtags and description in JSON format';
  // } else {
  //   prompt =
  //     'Describe en español y clasifica esta imagen en una de las siguientes categorias: ';
  // }
  const format = {
    type: 'object',
    properties: {
      rate: { type: 'integer' },
      category: { type: 'string' },
      description: { type: 'string' },
      hashtags: { type: 'string' },
    },
    required: ['rate', 'category', 'description', 'hashtags'],
  };

  getImage(token, id)
    .then((imagePath: string) => {
      // const ollama = new Ollama({ host: models[modelSelected]?.host });
      // https://github.com/ollama/ollama-js/blob/main/examples/structured_outputs/structured-outputs.ts
      console.log('prompt:', prompt);

      const host = models[modelSelected]?.host ?? '';
      const model = models[modelSelected]?.name ?? '';
      const images: Array<string> = [imagePath];
      ollamaQuery({
        host,
        model,
        prompt,
        images,
        format,
      })
        .then(async (response: string) => {
          const message: Response = JSON.parse(response) as Response;
          const reply =
            chatConfigs[userID].language === 'en'
              ? `Category: ${message.category}\n\nRate: ${message.rate}/10\n\nDescription: ${message.description}\n\nHashtags: ${message.hashtags}`
              : `Categoria: ${message.category}\n\nPuntuacion: ${message.rate}/10\n\nDescripcion: ${message.description}\n\nHashtags: ${message.hashtags}`;
          await ctx.telegram.sendMessage(ctx.message.chat.id, reply);
        })
        .catch(
          async (error: string) =>
            await ctx.telegram.sendMessage(
              ctx.message.chat.id,
              error.toString()
            )
        );
      /*
      ollama
        .generate({
          model: models[modelSelected]?.name ?? '',
          prompt,

          images: [imagePath],
          stream: false,
          format: schema,
        })
        .then(async (response) => {
          const message: Response = JSON.parse(response.response) as Response;
          const reply =
            chatConfigs[userID].language === 'en'
              ? `Category: ${message.category}\n\nRate: ${message.rate}/10\n\nDescription: ${message.description}\n\nHashtags: ${message.hashtags}`
              : `Categoria: ${message.category}\n\nPuntuacion: ${message.rate}/10\n\nDescripcion: ${message.description}\n\nHashtags: ${message.hashtags}`;
          await ctx.telegram.sendMessage(ctx.message.chat.id, reply);
        })
        .catch(
          async (error: string) =>
            await ctx.telegram.sendMessage(
              ctx.message.chat.id,
              error.toString()
            )
        );
        */
    })
    .catch(
      async (error: string) =>
        await ctx.telegram.sendMessage(ctx.message.chat.id, error.toString())
    );

  // const url = `https://api.telegram.org/bot${token}/getFile?file_id=${id}`;

  // fetch(url)
  //   .then((response) => {
  //     response
  //       .json()
  //       .then((data: any) => {
  //         const file_path = data.result.file_path;
  //         const url = `https://api.telegram.org/file/bot${token}/${file_path}`;
  //         const file = fs.createWriteStream(`./${file_path}`);
  //         https.get(url, function (response) {
  //           response.pipe(file);
  //           file.on('finish', () => {
  //             file.close();
  //             const imagePath = `./${file_path}`;
  //             const ollama = new Ollama({ host: models[modelSelected]?.host });
  //             // https://github.com/ollama/ollama-js/blob/main/examples/structured_outputs/structured-outputs.ts
  //             const schema = {
  //               type: 'object',
  //               properties: {
  //                 rate: { type: 'integer' },
  //                 category: { type: 'string' },
  //                 description: { type: 'string' },
  //                 hashtags: { type: 'string' },
  //               },
  //               required: ['rate', 'category', 'description', 'hashtags'],
  //             };
  //             console.log('prompt:', prompt);
  //             ollama
  //               .generate({
  //                 model: models[modelSelected]?.name ?? '',
  //                 prompt,

  //                 images: [imagePath],
  //                 stream: false,
  //                 format: schema,
  //               })
  //               .then(async (response) => {
  //                 const message: Response = JSON.parse(
  //                   response.response
  //                 ) as Response;
  //                 const reply =
  //                   chatConfigs[userID].language === 'en'
  //                     ? `Category: ${message.category}\n\nRate: ${message.rate}/10\n\nDescription: ${message.description}\n\nHashtags: ${message.hashtags}`
  //                     : `Categoria: ${message.category}\n\nPuntuacion: ${message.rate}/10\n\nDescripcion: ${message.description}\n\nHashtags: ${message.hashtags}`;
  //                 await ctx.telegram.sendMessage(ctx.message.chat.id, reply);
  //               })
  //               .catch(
  //                 async (error: string) =>
  //                   await ctx.telegram.sendMessage(
  //                     ctx.message.chat.id,
  //                     error.toString()
  //                   )
  //               );
  //           });
  //         });
  //       })
  //       .catch((e) => console.log('Error:', e));
  //   })
  //   .catch((e) => console.log('Error:', e));
});

bot.on(message('text'), async (ctx) => {
  // Explicit usage
  // console.log('>>>> messsage from:', ctx.update.message.from.id);
  const userID = ctx.update.message.from.id.toString();
  if (!(userID in chatConfigs)) {
    chatConfigs[userID] = {
      language: 'en',
    };
  }
  // console.log('>>>> messsage chat:', ctx.update.message.chat);
  // console.log('>>>> messsage chatConfigs:', chatConfigs);

  const message = ctx.update.message.text ?? '';

  let startMessage = '';

  if (chatConfigs[userID].language === 'en') {
    startMessage +=
      'Hi, I am an AI bot created by Chris G. for meme classification running on a ROG Ally PC! 🎮 (Please be patient, I might be slow to respond 😊). To start, send me a meme!';
    startMessage +=
      '\n\nPara Español, selecciona la opcion "espanol" que esta en el menu que esta aqui abajo\n👇';
  } else {
    startMessage +=
      'Hola, soy un robot con inteligencia artificial creado por Chris G. para clasificar memes, y funciono en una consola ROG Ally! 🎮 ';
    startMessage +=
      '(por favor se paciente, tal vez sea lento para responder) 😊. Para comenzar, solo mandame un meme!';
    startMessage +=
      '\n\nTo switch to English, just select "english" option in the menu below\n👇';
  }
  if (message === '/start') {
    // await ctx.telegram.sendMessage(ctx.message.chat.id, 'Haz una pregunta');
    await ctx.reply(startMessage);
  } else if (message === '/english') {
    chatConfigs[userID].language = 'en';
    await ctx.reply('Language set to English!\n');
    startMessage =
      'Hi, I am an AI bot created by Chris G. for meme classification running on a ROG Ally PC! 🎮 (Please be patient, I might be slow to respond 😊). To start, send me a meme!';
    startMessage +=
      '\n\nPara Español, selecciona la opcion "espanol" que esta en el menu que esta aqui abajo\n👇';
    await ctx.telegram.sendMessage(ctx.message.chat.id, startMessage);
  } else if (message === '/espanol') {
    chatConfigs[userID].language = 'es';
    await ctx.reply('Idioma del chat cambiado a Español!\n');
    startMessage =
      'Hola, soy un robot con inteligencia artificial creado por Chris G. para clasificar memes, y funciono en una consola ROG Ally! 🎮 ';
    startMessage +=
      '(por favor se paciente, tal vez sea lento para responder) 😊. Para comenzar, solo mandame un meme!';
    startMessage +=
      '\n\nTo switch to English, just select "english" option in the menu below\n👇';
    await ctx.telegram.sendMessage(ctx.message.chat.id, startMessage);
  } else if (message === '/about') {
    // await ctx.telegram.sendMessage(ctx.message.chat.id, 'Haz una pregunta');
    await ctx.reply(startMessage);
  } else if (message === '/llama3') {
    // await ctx.telegram.sendMessage(ctx.message.chat.id, 'Haz una pregunta');
    modelSelected = 'llama3';
  } else if (message === '/deepseek') {
    // await ctx.telegram.sendMessage(ctx.message.chat.id, 'Haz una pregunta');
    modelSelected = 'deepseek';
  } else if (message === '/pregunta') {
    await ctx.telegram.sendMessage(ctx.message.chat.id, 'Haz una pregunta');
  } else {
    // console.log('>>> Model selected:', models[modelSelected]);
    // const ollama = new Ollama({ host: models[modelSelected]?.host });
    // ollama
    //   .chat({
    //     model: models[modelSelected]?.name ?? '',
    //     messages: [
    //       {
    //         role: 'user',
    //         content: message,
    //       },
    //     ],
    //     stream: false,
    //   })
    //   .then(async (response: ChatResponse) => {
    //     const result = response.message.content ?? '';
    //     const message = result.replace(/\"/g, '');
    //     await ctx.telegram.sendMessage(ctx.message.chat.id, message);
    //   })
    //   .catch(
    //     async (error: string) =>
    //       await ctx.telegram.sendMessage(ctx.message.chat.id, error.toString())
    //   );
  }
});

bot.on('callback_query', async (ctx) => {
  // Explicit usage
  await ctx.telegram.answerCbQuery(ctx.callbackQuery.id);

  // Using context shortcut
  await ctx.answerCbQuery();
});
// bot.on('inline_query', async (ctx) => {
//   const result: Array<InlineQueryResult> = [];
//   // Explicit usage
//   console.log('>>> inline quey');
//   await ctx.telegram.answerInlineQuery(ctx.inlineQuery.id, result);

//   // Using context shortcut
//   await ctx.answerInlineQuery(result);
// });

bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
