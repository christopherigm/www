import { useState } from 'react';
import Languages from '@repo/interfaces/languages';
import TextInput from '@repo/ui/generic-text-input';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';

type Props = {
  language: Languages;
  label: {
    [x in Languages]: string;
  };
  value: Array<string>;
  onChange: (value: Array<string>) => void;
  disabled?: boolean;
};

const GenericToDoList = ({ language, label, value, onChange }: Props) => {
  const [newItemText, setNewItemText] = useState('');

  const handleDelete = (index: number) => {
    const tmp = [...value];
    tmp.splice(index, 1);
    onChange(tmp);
  };

  const handleAdd = () => {
    const tmp = [...value];
    tmp.push(newItemText);
    onChange(tmp);
    setNewItemText('');
  };

  return (
    <>
      <Stack direction="row" spacing={1} flexWrap={'wrap'}>
        {value.map((i: string, index: number) => {
          return (
            <Chip
              key={index}
              label={i}
              variant="outlined"
              size="medium"
              onDelete={() => handleDelete(index)}
            />
          );
        })}
      </Stack>
      <Box height={15}></Box>
      <TextInput
        language={language}
        label={label}
        value={newItemText}
        onChange={(value) => setNewItemText(value)}
        onEnter={handleAdd}
      />
      <Box height={15}></Box>
      <Box display="flex" justifyContent="center">
        <Button
          onClick={handleAdd}
          variant="contained"
          color="primary"
          sx={{
            textTransform: 'initial',
          }}
        >
          {language === 'en' ? 'Add' : 'Agregar'}
        </Button>
      </Box>
    </>
  );
};

export default GenericToDoList;
