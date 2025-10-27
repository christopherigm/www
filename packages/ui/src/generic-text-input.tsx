'use client';

import Languages from '@repo/interfaces/languages';
import TextField from '@mui/material/TextField';
import { ChangeEvent, HTMLInputTypeAttribute, KeyboardEvent } from 'react';

type Props = {
  label: {
    [x in Languages]: string;
  };
  placeholder?: {
    [x in Languages]: string;
  };
  language: Languages;
  value: string;
  onChange: (value: string) => void;
  onEnter?: () => void;
  type?: HTMLInputTypeAttribute | undefined;
  disabled?: boolean;
  required?: boolean;
  autoComplete?: string;
  name?: string;
  multiline?: boolean;
  rows?: number;
};

const GenericTextInput = ({
  language,
  label,
  placeholder,
  value,
  onChange,
  onEnter,
  type = 'text',
  disabled = false,
  required = false,
  autoComplete = 'none',
  name,
  multiline,
  rows,
}: Props) => {
  return (
    <TextField
      label={label[language]}
      placeholder={placeholder ? placeholder[language] : ''}
      variant="outlined"
      size="small"
      type={type}
      name={name}
      autoComplete={autoComplete}
      autoSave="none"
      disabled={disabled}
      value={value}
      onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
        onChange(e.target.value)
      }
      sx={{
        flexGrow: 1,
      }}
      onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && onEnter !== undefined) {
          onEnter();
        }
      }}
      multiline={multiline}
      rows={rows}
      required={required}
    />
  );
};

export default GenericTextInput;
