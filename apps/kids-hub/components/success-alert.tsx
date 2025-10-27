import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import type Languages from '@repo/interfaces/languages';

type Props = {
  success: boolean | null;
  language: Languages;
};

const SucessAlert = ({ success = null, language = 'en' }: Props) => {
  if (success === null) {
    return null;
  }

  return (
    <Grid size={{ xs: 12 }}>
      <Stack sx={{ width: '100%' }} spacing={2}>
        {success ? (
          <Alert severity="success">
            {language === 'en' ? 'Correct!' : 'Correcto!'}
          </Alert>
        ) : (
          <Alert severity="error">
            {language === 'en'
              ? 'Not quite correct :('
              : 'Respuesta incorrecta :('}
          </Alert>
        )}
      </Stack>
    </Grid>
  );
};

export default SucessAlert;
