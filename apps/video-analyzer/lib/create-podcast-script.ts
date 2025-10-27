import Post from '@repo/helpers/api-post';

const CreatePodcastScript = (
  id: string,
  language: string,
  codeLanguage: string,
  speakers: Array<string>,
  mood: string,
  name: string,
  instrucctions: string,
  length: string
): Promise<void> => {
  return new Promise((res, rej) => {
    Post('/generate-podcast-script', {
      id,
      language,
      codeLanguage,
      speakers,
      mood,
      name,
      instrucctions,
      length,
    })
      .then((response) => res(response))
      .catch((e) => rej(e));
  });
};

export default CreatePodcastScript;
