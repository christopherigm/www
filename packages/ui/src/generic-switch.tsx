'use client';

import Languages from '@repo/interfaces/languages';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';

type Props = {
  label?: {
    [x in Languages]: string;
  };
  language: Languages;
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
};

const GenericSwitch = ({
  language,
  label,
  value,
  onChange,
  disabled = false,
}: Props) => {
  return (
    <FormGroup>
      <FormControlLabel
        control={
          <Switch
            value={value}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              onChange(event.target.checked)
            }
          />
        }
        label={label ? label[language] : label}
        disabled={disabled}
        sx={{
          margin: 0,
          marginRight: -1,
        }}
      />
    </FormGroup>
  );
};

export default GenericSwitch;
