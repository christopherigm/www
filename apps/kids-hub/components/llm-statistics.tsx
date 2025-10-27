import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import nanoToSeconds from '@repo/helpers/nanoseconds-to-seconds';
import type Languages from '@repo/interfaces/languages';
import Chip from '@mui/material/Chip';

type Props = {
  evalCount: number;
  totalDuration: number;
  language: Languages;
};

const LLMStatistics = ({
  evalCount = 0,
  totalDuration = 0,
  language = 'en',
}: Props) => {
  if (!evalCount && !totalDuration) {
    return null;
  }

  const total = nanoToSeconds(totalDuration);

  return (
    <Grid size={{ xs: 12 }}>
      <Stack direction="row" spacing={1} marginTop={2} flexWrap="wrap">
        {evalCount ? (
          <Chip label={`Tokens: ${evalCount}`} variant="outlined" />
        ) : null}
        {total ? (
          <Chip
            label={
              language === 'en' ? `Duration: ${total}s` : `Duracion: ${total}s`
            }
            variant="outlined"
          />
        ) : null}
      </Stack>
    </Grid>
  );
};

export default LLMStatistics;
