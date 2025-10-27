'use client';

import { useEffect, useState } from 'react';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';

type Props = {
  value: number;
  onChange?: (value: string) => void;
  onSubmit?: () => void;
  offset?: number;
  numberOfRef?: number;
};

const NumberToInputArray = ({
  value = 0,
  onChange,
  onSubmit,
  offset = 0,
  numberOfRef = 0,
}: Props) => {
  const itemWidth = 15;
  const [resultInputs, setResultInputs] = useState<Array<string>>([]);
  const [digits, setDigits] = useState<Array<string>>([]);

  useEffect(() => {
    // console.log('value', value);
    let digits: Array<string> = [];
    if (value === 0 && numberOfRef) {
      digits = numberOfRef
        .toString()
        .split('')
        .map(() => '');
    } else {
      digits = value.toString().split('');
    }
    setDigits(digits);
    setResultInputs(digits.map(() => ''));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  if (!digits.length) {
    return null;
  }

  return (
    <Box
      display="flex"
      flexDirection="row"
      marginRight={offset * 4.7}
      marginBottom={1}
    >
      {digits.map((_i: string, index: number) => {
        return (
          <TextField
            key={index}
            variant="outlined"
            size="small"
            type="tel"
            autoComplete="none"
            autoSave="none"
            value={resultInputs[index] ?? ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              // setSuccess(null);
              const tmpResultInputs = [...resultInputs];
              tmpResultInputs[index] = e.target.value;
              setResultInputs(tmpResultInputs);
              // setResult(tmpResultInputs.join(''));
              onChange && onChange(tmpResultInputs.join(''));
            }}
            onSubmit={onSubmit}
            sx={{
              marginLeft: 0.5,
              input: {
                width: itemWidth,
                textAlign: 'center',
                paddingLeft: 1.2,
                paddingRight: 1.2,
              },
            }}
          />
        );
      })}
      {/* {number} */}
    </Box>
  );
};

export default NumberToInputArray;
