"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/no-explicit-any */
// https://www.geeksforgeeks.org/how-to-setup-a-typescript-project/
const telegraf_1 = require("telegraf");
const filters_1 = require("telegraf/filters");
const ollama_1 = require("ollama");
const https_1 = __importDefault(require("https"));
const fs_1 = __importDefault(require("fs"));
const getImage = (token, id) => {
    return new Promise((res, rej) => {
        const url = `https://api.telegram.org/bot${token}/getFile?file_id=${id}`;
        fetch(url)
            .then((response) => {
            response
                .json()
                .then((data) => {
                const file_path = data.result.file_path;
                const url = `https://api.telegram.org/file/bot${token}/${file_path}`;
                const file = fs_1.default.createWriteStream(`./${file_path}`);
                https_1.default.get(url, function (response) {
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
const ollamaQuery = (data) => {
    return new Promise((res, rej) => {
        const { host, model, prompt, images, format } = data;
        const ollama = new ollama_1.Ollama({ host });
        ollama
            .generate({
            model,
            prompt,
            images,
            format,
            stream: false,
        })
            .then((value) => { var _a; return res((_a = value.response) !== null && _a !== void 0 ? _a : ''); })
            .catch((e) => rej(e));
    });
};
const models = {
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
let modelSelected = 'llava';
const chatConfigs = {};
const token = (_a = process.env.BOT_TOKEN) !== null && _a !== void 0 ? _a : '';
const bot = new telegraf_1.Telegraf(token);
bot.command('quit', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.telegram.leaveChat(ctx.message.chat.id);
    yield ctx.leaveChat();
}));
bot.on((0, filters_1.message)('photo'), (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const userID = ctx.update.message.from.id.toString();
    if (!(userID in chatConfigs)) {
        chatConfigs[userID] = {
            language: 'en',
        };
    }
    const photos = (_a = ctx.update.message.photo) !== null && _a !== void 0 ? _a : [];
    const id = (_c = (_b = photos[photos.length - 1]) === null || _b === void 0 ? void 0 : _b.file_id) !== null && _c !== void 0 ? _c : '';
    if (chatConfigs[userID].language === 'en') {
        yield ctx.reply("Alright, give me a moment please... (I'll send you a message once done, I might be slow to respond 😊).");
    }
    else {
        yield ctx.reply('Muy bien, dame un momento por favor... (Te enviare un mensaje cuando termine, quiza me tarde un poco 😊).');
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
        .then((imagePath) => {
        var _a, _b, _c, _d;
        // const ollama = new Ollama({ host: models[modelSelected]?.host });
        // https://github.com/ollama/ollama-js/blob/main/examples/structured_outputs/structured-outputs.ts
        console.log('prompt:', prompt);
        const host = (_b = (_a = models[modelSelected]) === null || _a === void 0 ? void 0 : _a.host) !== null && _b !== void 0 ? _b : '';
        const model = (_d = (_c = models[modelSelected]) === null || _c === void 0 ? void 0 : _c.name) !== null && _d !== void 0 ? _d : '';
        const images = [imagePath];
        ollamaQuery({
            host,
            model,
            prompt,
            images,
            format,
        })
            .then((response) => __awaiter(void 0, void 0, void 0, function* () {
            const message = JSON.parse(response);
            const reply = chatConfigs[userID].language === 'en'
                ? `Category: ${message.category}\n\nRate: ${message.rate}/10\n\nDescription: ${message.description}\n\nHashtags: ${message.hashtags}`
                : `Categoria: ${message.category}\n\nPuntuacion: ${message.rate}/10\n\nDescripcion: ${message.description}\n\nHashtags: ${message.hashtags}`;
            yield ctx.telegram.sendMessage(ctx.message.chat.id, reply);
        }))
            .catch((error) => __awaiter(void 0, void 0, void 0, function* () {
            return yield ctx.telegram.sendMessage(ctx.message.chat.id, error.toString());
        }));
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
        .catch((error) => __awaiter(void 0, void 0, void 0, function* () { return yield ctx.telegram.sendMessage(ctx.message.chat.id, error.toString()); }));
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
}));
bot.on((0, filters_1.message)('text'), (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
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
    const message = (_a = ctx.update.message.text) !== null && _a !== void 0 ? _a : '';
    let startMessage = '';
    if (chatConfigs[userID].language === 'en') {
        startMessage +=
            'Hi, I am an AI bot created by Chris G. for meme classification running on a ROG Ally PC! 🎮 (Please be patient, I might be slow to respond 😊). To start, send me a meme!';
        startMessage +=
            '\n\nPara Español, selecciona la opcion "espanol" que esta en el menu que esta aqui abajo\n👇';
    }
    else {
        startMessage +=
            'Hola, soy un robot con inteligencia artificial creado por Chris G. para clasificar memes, y funciono en una consola ROG Ally! 🎮 ';
        startMessage +=
            '(por favor se paciente, tal vez sea lento para responder) 😊. Para comenzar, solo mandame un meme!';
        startMessage +=
            '\n\nTo switch to English, just select "english" option in the menu below\n👇';
    }
    if (message === '/start') {
        // await ctx.telegram.sendMessage(ctx.message.chat.id, 'Haz una pregunta');
        yield ctx.reply(startMessage);
    }
    else if (message === '/english') {
        chatConfigs[userID].language = 'en';
        yield ctx.reply('Language set to English!\n');
        startMessage =
            'Hi, I am an AI bot created by Chris G. for meme classification running on a ROG Ally PC! 🎮 (Please be patient, I might be slow to respond 😊). To start, send me a meme!';
        startMessage +=
            '\n\nPara Español, selecciona la opcion "espanol" que esta en el menu que esta aqui abajo\n👇';
        yield ctx.telegram.sendMessage(ctx.message.chat.id, startMessage);
    }
    else if (message === '/espanol') {
        chatConfigs[userID].language = 'es';
        yield ctx.reply('Idioma del chat cambiado a Español!\n');
        startMessage =
            'Hola, soy un robot con inteligencia artificial creado por Chris G. para clasificar memes, y funciono en una consola ROG Ally! 🎮 ';
        startMessage +=
            '(por favor se paciente, tal vez sea lento para responder) 😊. Para comenzar, solo mandame un meme!';
        startMessage +=
            '\n\nTo switch to English, just select "english" option in the menu below\n👇';
        yield ctx.telegram.sendMessage(ctx.message.chat.id, startMessage);
    }
    else if (message === '/about') {
        // await ctx.telegram.sendMessage(ctx.message.chat.id, 'Haz una pregunta');
        yield ctx.reply(startMessage);
    }
    else if (message === '/llama3') {
        // await ctx.telegram.sendMessage(ctx.message.chat.id, 'Haz una pregunta');
        modelSelected = 'llama3';
    }
    else if (message === '/deepseek') {
        // await ctx.telegram.sendMessage(ctx.message.chat.id, 'Haz una pregunta');
        modelSelected = 'deepseek';
    }
    else if (message === '/pregunta') {
        yield ctx.telegram.sendMessage(ctx.message.chat.id, 'Haz una pregunta');
    }
    else {
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
}));
bot.on('callback_query', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    // Explicit usage
    yield ctx.telegram.answerCbQuery(ctx.callbackQuery.id);
    // Using context shortcut
    yield ctx.answerCbQuery();
}));
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
