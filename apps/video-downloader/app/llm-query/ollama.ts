/* eslint-disable @typescript-eslint/no-explicit-any */
import { EmbedResponse, GenerateResponse, Ollama } from 'ollama';
import RandomNumber from '@repo/helpers/random-number';
import embeddings from './embeddings.json';

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
}): Promise<GenerateResponse> => {
  return new Promise((res, rej) => {
    const NODE_ENV = process.env.NODE_ENV ?? 'development';

    const system_one_line =
      "You are an experienced and very skilled songwriter that writes poetic, meaningful and rhythmic lyrics with melodic chorus. You can write lyrics in any language.  You avoid repeating the same word twice in the same paragraph. You write lyrics with simple words easy to understand. You avoid religious tone. Avoid paragraph headers.  Keep going until the job is completely solved before ending your turn. Use your tools, don't guess and don't hallucinate. Plan thoroughly before every tool call and reflect on the outcome after.";
    let system = 'You are an experienced and very skilled songwriter ';
    system += 'that writes poetic, meaningful and rhythmic lyrics ';
    system += 'with melodic chorus. ';
    system += 'You can write lyrics in any language. ';
    system += 'You avoid repeating the same word twice in the same paragraph. ';
    system += 'You write lyrics with simple words easy to understand. ';
    system += 'You avoid religious tone. ';
    system += 'Avoid paragraph headers. ';
    system +=
      "Keep going until the job is completely solved before ending your turn. Use your tools, don't guess and don't hallucinate. Plan thoroughly before every tool call and reflect on the outcome after.";

    const {
      host = NODE_ENV === 'development'
        ? 'http://127.0.0.1:11434'
        : models.gemma3.host,
      model = models.gemma3.name,
      prompt,
      reference,
    } = data;
    // const ollama = new Ollama({ host });

    const _staticRef = `How to write Lyrics: 
Say What You Mean, Not What Rhymes
This is something I stand by. When you begin songwriting, it's easy to get all “rhymey.” If you don't care about the clarity of your point, have at it. But if you do care, the inclination to rhyme will compromise your message. Say what you mean, not just what rhymes. This can be a challenge, but that's the beauty of our language. There are endless words at our disposal, and endless arrangements in which to put them. So if you get in a rut, there's absolutely no shame in pulling up a rhyming dictionary! It's a very useful tool. Especially for learning new words and finding slant rhymes. Slant rhymes are an awesome way to navigate the rhyming challenge. In my example above, I rhyme the words, “breath, rest, past and ask.” None of these are direct rhymes. But they sound lovely together.

Use a Thesaurus
I have expanded my vocabulary in the practice of songwriting. If you have a word that means what you want to say, but it doesn't fit, look for synonyms! I do this all the time. It can make for a more eloquent message, while improving the ability to express yourself.

Syllabic Parallels
Everything you write has syllables. Syllable has three syllables. And lyrics (soon to be melodies) with syllabic similarities can be powerful. However, just like rhyming, you don't want to pigeonhole your message into a strict frame. In the example above, the first line has 12 syllables, the second line 10, the third line 10, and the fourth line 10. They don't line up perfectly but having a similar number of syllables makes for an easier time writing melodies and counter-melodies. This is not a hard and fast rule, but simply a tool. You don't use a hammer to drill a hole. Use it when it makes sense.

Symbolism
Symbols. Symbols. Symbols. The world symbol is a symbol to describe a symbol. Let that sink in. Every single word is a symbol, our best guess at describing something we know or believe to be true. Every word I'm using to communicate to you right now is a symbol. We agree upon symbols and that's why they work. If I say, “hey look at that tree,” you know what I'm talking about, because we both agree to call that thing a tree. Don Miguel Ruiz is a huge inspiration of mine. He maps this out clearly in the book, “The Fifth Agreement.” The easiest way to start using symbolism in your lyrics is to employ the power of metaphors and similes. We're using words (symbols) to describe an abstract idea, which creates a new, even more complex symbol. The use of metaphors and similes bring your lyricism to the next level. Instead of saying, “my room is messy” you could say, “my room is like the aftermath of a tornado,” or, “my room is the aftermath of a tornado.” Here is an example of a chorus I wrote using symbolism.

The lies in my mind, they fly around like starlings
The lies are LIKE starlings (simile)

Murmurs cloud the sky as dusk falls 'fore night
A murmur is the term used for a large group of starlings. Here I'm saying murmurs (lies) cloud the sky (my mind). I'm not directly saying the lies are like murmurs, I already established that with a simile. I'm also not directly saying the sky is my mind, I already established that image in the first line. This is an example of a metaphor.

I may lose my way but know I love you darling
Stay sharp sweetheart, from the depths I'll come out crawling

There are endless tools I could talk about (alliteration, internal rhyme, personification, pathetic fallacy, etc.) to spice up your lyrics. But the 5 suggestions above will start you on a great path toward writing meaningful pieces.`;

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
            prompt: `Using this data: ${embeddings}. Respond to this prompt: ${prompt}`,
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
