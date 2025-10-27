import Grid from '@mui/material/Grid';
import SettingsBackupRestoreIcon from '@mui/icons-material/SettingsBackupRestore';
import type Languages from '@repo/interfaces/languages';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { useState } from 'react';
import IconButton from '@mui/material/IconButton';

type Props = {
  isLoading: boolean;
  callback: () => void;
};

const useFormHeader = ({ isLoading = false, callback }: Props) => {
  const [language, setLanguage] = useState<Languages>('en');

  const header = (
    <Grid size={{ xs: 12 }} display="flex" justifyContent="space-between">
      <FormControl size="small" disabled={isLoading}>
        <InputLabel id="language">
          {language === 'en' ? 'Language' : 'Idioma'}
        </InputLabel>
        <Select
          labelId="language"
          id="language-select"
          value={language.toString()}
          label={language === 'en' ? 'Language' : 'Idioma'}
          onChange={(e) => setLanguage(e.target.value as Languages)}
          disabled={isLoading}
        >
          <MenuItem value={'en'}>English</MenuItem>
          <MenuItem value={'es'}>Espanol</MenuItem>
        </Select>
      </FormControl>
      <IconButton
        aria-label="reset"
        size="small"
        onClick={callback}
        disabled={isLoading}
        color="default"
      >
        <SettingsBackupRestoreIcon fontSize="medium" />
      </IconButton>
    </Grid>
  );

  return {
    header,
    language,
  };
};

export default useFormHeader;
