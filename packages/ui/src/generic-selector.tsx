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
  name?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
};

const GenericSelector = ({
  language,
  label,
  options,
  name,
  value,
  defaultValue = ' ',
  onChange,
}: Props) => {
  const id = name ? `${name}-label` : 'select-dropdown';
  return (
    <FormControl fullWidth>
      <InputLabel id={id}>{label[language]}</InputLabel>
      <Select
        labelId={id}
        id={name}
        name={name}
        value={value}
        defaultValue={defaultValue}
        label={label[language]}
        onChange={(e) => {
          if (onChange !== undefined) {
            onChange(e.target.value);
          }
        }}
        size="small"
      >
        {defaultValue === ' ' ? (
          <MenuItem value="">
            {language === 'es' ? 'Seleccionar' : 'Select'}
          </MenuItem>
        ) : null}
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
