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
  defaultChecked?: boolean;
};

const GenericSwitch = ({
  language,
  label,
  value,
  onChange,
  disabled = false,
  defaultChecked,
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
            defaultChecked={defaultChecked}
          />
        }
        label={label ? label[language] : label}
        disabled={disabled}
        sx={{
          margin: 0,
          marginRight: -1,
        }}
        defaultChecked={defaultChecked}
      />
    </FormGroup>
  );
};

export default GenericSwitch;
