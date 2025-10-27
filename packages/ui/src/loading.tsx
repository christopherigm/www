import { Box, CircularProgress } from '@mui/material';

type Props = {
  open: boolean;
};

const Loading = ({ open }: Props) => {
  return (
    <>
      {open ? (
        <Box
          position="fixed"
          display="flex"
          width="100%"
          sx={{
            inset: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
          }}
          zIndex={9999}
          justifyContent="center"
          alignItems="center"
        >
          <CircularProgress size={70} />
        </Box>
      ) : null}
    </>
  );
};

export default Loading;
