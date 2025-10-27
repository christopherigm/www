import Box from '@mui/material/Box';

type Props = {
  height?: number;
};

const Divisor = ({ height = 15 }: Props) => <Box height={height}></Box>;

export default Divisor;
