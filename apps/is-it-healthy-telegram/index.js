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
    const checks = 'food, meal, candy, drink or dessert';
    prompt = 'You are a nutritionist. ';
    prompt += 'Classify this image in one of the following categories: ';
    prompt += 'breakfast, lunch, dinner, dessert, drink. ';
    prompt += `Then extract all the ingredients to make the ${checks} in a comma-separated list. `;
    prompt += `Then generate a recipe to recreate the ${checks}. `;
    prompt += 'Recipe must contain the steps. ';
    prompt += `Then write a recommendation about the consumption of the ${checks} `;
    prompt += 'and its possible negative health implications. ';
    // prompt += 'with focus in sodium, fat, preservatives and sugar levels. ';
    prompt += `Then, rate the ${checks} in the image on a scale from 1 to 10, where 1 is not healthy and 10 is healthy. `;
    // prompt += 'according to the previous recommendation. ';
    prompt += `Then Name the ${checks} according to its characteristics. `;
    prompt +=
        'Respond with: category, rate, name, recipe, ingredients, recommendation in JSON format';
    const format = {
        type: 'object',
        properties: {
            rate: { type: 'integer' },
            name: { type: 'string' },
            category: { type: 'string' },
            ingredients: { type: 'string' },
            recipe: { type: 'string' },
            recommendation: { type: 'string' },
            error: { type: 'boolean' },
        },
        required: [
            'rate',
            'name',
            'category',
            'ingredients',
            'recipe',
            'recommendation',
            'error',
        ],
    };
    getImage(token, id)
        .then((imagePath) => {
        // const ollama = new Ollama({ host: models[modelSelected]?.host });
        // https://github.com/ollama/ollama-js/blob/main/examples/structured_outputs/structured-outputs.ts
        // console.log('prompt:', prompt);/
        var _a, _b, _c, _d;
        const host = (_b = (_a = models[modelSelected]) === null || _a === void 0 ? void 0 : _a.host) !== null && _b !== void 0 ? _b : '';
        const model = (_d = (_c = models[modelSelected]) === null || _c === void 0 ? void 0 : _c.name) !== null && _d !== void 0 ? _d : '';
        const images = [imagePath];
        let checkPrompt = 'You have perfect vision and pay great ';
        checkPrompt += 'attention, you are very good at ';
        checkPrompt += 'identifying food on images. ';
        checkPrompt += 'Analyze the image and confirm ';
        checkPrompt += 'that the image has real food for humans in it. ';
        checkPrompt += 'Respond just with: true or false. ';
        console.log('Check prompt:', checkPrompt);
        ollamaQuery({
            host,
            model,
            prompt: checkPrompt,
            images,
            format: {
                type: 'object',
                properties: { response: { type: 'boolean' } },
                required: ['response'],
            },
        })
            .then((response) => __awaiter(void 0, void 0, void 0, function* () {
            const messageIsImage = JSON.parse(response);
            console.log('Does the image contain any food?:', messageIsImage.response);
            if (messageIsImage.response) {
                console.log('Prompt:', prompt);
                ollamaQuery({
                    host,
                    model,
                    prompt,
                    images,
                    format,
                })
                    .then((response) => __awaiter(void 0, void 0, void 0, function* () {
                    var _a, _b;
                    console.log('>>>>> LLM response:', response);
                    const message = JSON.parse(response);
                    let reply = '';
                    let rate = 0;
                    let rateIcon = '';
                    rate = Number(message.rate);
                    if (rate >= 1 && rate <= 3) {
                        rateIcon = '❌';
                    }
                    else if (rate >= 4 && rate <= 6) {
                        rateIcon = '⚠️';
                    }
                    else {
                        rateIcon = '✅';
                    }
                    if (chatConfigs[userID].language === 'en') {
                        if (message.category == 'error' || message.error) {
                            reply =
                                'It seems that the image does not contains any food or drinks 🙈';
                        }
                        else {
                            reply = `"${message.name}"\n\n`;
                            reply += `Classification: ${message.category}\n\n`;
                            reply += `Rate: ${message.rate} out of 10 ${rateIcon}\n\n`;
                            reply += `Recommendation: ${message.recommendation}\n\n`;
                            if (message.ingredients) {
                                reply += `Ingredients: ${message.ingredients}\n\n`;
                            }
                            if (message.recipe) {
                                reply += `Recipe:\n${message.recipe}\n\n`;
                            }
                        }
                        yield ctx.telegram.sendMessage(ctx.message.chat.id, reply);
                    }
                    else {
                        if (message.category == 'error' || message.error) {
                            reply =
                                'Parece que la imagen no contiene comida o bebidas 🙈';
                            return yield ctx.telegram.sendMessage(ctx.message.chat.id, reply);
                        }
                        else {
                            let translationPrompt = 'Translate the following text from english to spanish: ';
                            translationPrompt += `Category: ${message.category}. `;
                            translationPrompt += `Recommendation: "${message.recommendation.replace(/\\n/g, '')}". `;
                            translationPrompt += `Ingredients: "${(_a = message.ingredients) === null || _a === void 0 ? void 0 : _a.replace(/\\n/g, '')}". `;
                            translationPrompt += `Recipe: "${(_b = message.recipe) === null || _b === void 0 ? void 0 : _b.replace(/\\n/g, '')}". `;
                            console.log('>>>>> Translation prompt:', translationPrompt);
                            ollamaQuery({
                                host: models['llama3'].host,
                                model: models['llama3'].name,
                                prompt: translationPrompt,
                                images,
                                format: {
                                    type: 'object',
                                    properties: {
                                        category: { type: 'string' },
                                        ingredients: { type: 'string' },
                                        recipe: { type: 'string' },
                                        recommendation: { type: 'string' },
                                    },
                                    required: [
                                        'category',
                                        'ingredients',
                                        'recipe',
                                        'recommendation',
                                    ],
                                },
                            })
                                .then((translationResponse) => __awaiter(void 0, void 0, void 0, function* () {
                                console.log('>>>>> Translation response:', translationResponse);
                                const translation = JSON.parse(translationResponse);
                                reply = `"${message.name}"\n\n`;
                                reply += `Clasificacion: ${translation.category}\n\n`;
                                reply += `Puntuacion: ${message.rate} de 10 ${rateIcon}\n\n`;
                                reply += `Recomendacion: ${translation.recommendation}\n\n`;
                                if (translation.ingredients) {
                                    reply += `Ingredientes: ${translation.ingredients}\n\n`;
                                }
                                if (translation.recipe) {
                                    reply += `Receta:\n${translation.recipe}\n\n`;
                                }
                                yield ctx.telegram.sendMessage(ctx.message.chat.id, reply);
                            }))
                                .catch((error) => __awaiter(void 0, void 0, void 0, function* () {
                                return yield ctx.telegram.sendMessage(ctx.message.chat.id, error.toString());
                            }));
                        }
                    }
                }))
                    .catch((error) => __awaiter(void 0, void 0, void 0, function* () {
                    return yield ctx.telegram.sendMessage(ctx.message.chat.id, error.toString());
                }));
            }
            else {
                if (chatConfigs[userID].language === 'en') {
                    yield ctx.telegram.sendMessage(ctx.message.chat.id, 'It seems that the image does not contains any food or drinks 🙈');
                }
                else {
                    yield ctx.telegram.sendMessage(ctx.message.chat.id, 'Parece que la imagen no contiene comida o bebidas 🙈');
                }
            }
        }))
            .catch((error) => __awaiter(void 0, void 0, void 0, function* () {
            return yield ctx.telegram.sendMessage(ctx.message.chat.id, error.toString());
        }));
    })
        .catch((error) => __awaiter(void 0, void 0, void 0, function* () { return yield ctx.telegram.sendMessage(ctx.message.chat.id, error.toString()); }));
}));
bot.on((0, filters_1.message)('text'), (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userID = ctx.update.message.from.id.toString();
    if (!(userID in chatConfigs)) {
        chatConfigs[userID] = {
            language: 'en',
        };
    }
    const message = (_a = ctx.update.message.text) !== null && _a !== void 0 ? _a : '';
    let startMessage = '';
    if (chatConfigs[userID].language === 'en') {
        startMessage +=
            'Hi, I am an AI bot created by Christopher Guzman for food and drinks classification running on a ROG Ally PC! 🎮 ';
        startMessage +=
            '(Please be patient, I might be slow to respond 😊). To start, send me a picture of your meal or drink!';
        startMessage +=
            '\n\nPara Español, selecciona la opcion "espanol" que esta en el menu que esta aqui abajo\n👇';
    }
    else {
        startMessage +=
            'Hola, soy un robot con inteligencia artificial creado por Christopher Guzman para clasificar comida y bebidas, y funciono en una consola ROG Ally! 🎮 ';
        startMessage +=
            '(por favor se paciente, tal vez sea lento para responder) 😊. Para comenzar, solo mandame una foto de tu platillo o bebida!';
        startMessage +=
            '\n\nTo switch to English, just select "english" option in the menu below\n👇';
    }
    if (message === '/start') {
        yield ctx.reply(startMessage);
    }
    else if (message === '/english') {
        chatConfigs[userID].language = 'en';
        startMessage +=
            'Hi, I am an AI bot created by Christopher Guzman for food and drinks classification running on a ROG Ally PC! 🎮 ';
        startMessage +=
            '(Please be patient, I might be slow to respond 😊). To start, send me a picture of your meal or drink!';
        startMessage +=
            '\n\nPara Español, selecciona la opcion "espanol" que esta en el menu que esta aqui abajo\n👇';
        yield ctx.telegram.sendMessage(ctx.message.chat.id, startMessage);
    }
    else if (message === '/espanol') {
        chatConfigs[userID].language = 'es';
        startMessage =
            'Hola, soy un robot con inteligencia artificial creado por Christopher Guzman para clasificar comida y bebidas, y funciono en una consola ROG Ally! 🎮 ';
        startMessage +=
            '(por favor se paciente, tal vez sea lento para responder) 😊. Para comenzar, solo mandame una foto de tu platillo o bebida!';
        startMessage +=
            '\n\nTo switch to English, just select "english" option in the menu below\n👇';
        yield ctx.telegram.sendMessage(ctx.message.chat.id, startMessage);
    }
    else if (message === '/about') {
        yield ctx.reply(startMessage);
    }
}));
bot.launch();
// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
