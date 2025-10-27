import Box from '@mui/material/Box';

type Props = {
  margin?: number;
};

const HorizontalDivisor = ({ margin = 0 }: Props) => (
  <Box
    marginTop={margin}
    marginBottom={margin}
    borderBottom="1px solid #ddd"
    width="100%"
  ></Box>
);

export default HorizontalDivisor;
