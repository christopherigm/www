'use client';

import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Languages from '@repo/interfaces/languages';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';

type Props = {
  label: {
    [x in Languages]: string;
  };
  language: Languages;
  options: Array<{
    value: string;
    label?: {
      [x in Languages]: string;
    };
  }>;
  value: string;
  onChange: (value: string) => void;
};

const GenericSelector = ({
  language,
  label,
  options,
  value,
  onChange,
}: Props) => {
  return (
    <FormControl fullWidth>
      <InputLabel id="language-select-label">{label[language]}</InputLabel>
      <Select
        labelId="language-select-label"
        id="language-select"
        value={value}
        label={label[language]}
        onChange={(e) => onChange(e.target.value)}
        size="small"
      >
        {options.map((i, index: number) => {
          return (
            <MenuItem key={index} value={i.value}>
              {i.label ? i.label[language] : value}
            </MenuItem>
          );
        })}
      </Select>
    </FormControl>
  );
};

export default GenericSelector;
