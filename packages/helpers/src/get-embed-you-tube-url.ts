const GetEmbedYouTubeURL = (url: string): string => {
  // Raw:  https://youtu.be/tgbNymZ7vqY?foo=bar
  // Goal: https://www.youtube.com/embed/tgbNymZ7vqY
  const pieces = url.split('/');
  if (pieces.length > 1) {
    const id = pieces[pieces.length - 1];
    return `https://www.youtube.com/embed/${id}`;
  }
  return '';
};

export default GetEmbedYouTubeURL;
