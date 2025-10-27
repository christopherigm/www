const SRTToText = (srt: string): string => {
  const rows = srt.replaceAll('\n\n', '\n').replaceAll('\n ', '').split('\n');
  const rawSubtitles = rows.filter((row) => {
    if (
      row.search('</c>') < 0 &&
      row.search('-->') < 0 &&
      row.search('WEBVTT') < 0 &&
      row.search('Kind: captions') < 0 &&
      row.search('Language: en') < 0 &&
      row.search('Language: es') < 0 &&
      isNaN(Number(row))
    ) {
      return row;
    }
    return null;
  });
  const clean = rawSubtitles
    .filter((row, index: number) => {
      if (index < rawSubtitles.length - 1) {
        const nextRow = rawSubtitles[index + 1]?.trim();
        if (row.trim() === nextRow) {
          return null;
        }
      }
      return row;
    })
    .join('\n');
  return clean;
};

export default SRTToText;
