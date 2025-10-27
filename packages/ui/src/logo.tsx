import Link from 'next/link';
import Box from '@mui/material/Box';
// import './logo.scss';

type Props = {
  src?: string;
  width?: number;
  fullWidth?: boolean;
  showAlways?: boolean;
};

const Logo = ({
  src = '',
  width = 100,
  fullWidth = false,
  showAlways = false,
}: Props) => {
  const logo =
    src ??
    process.env.NEXT_PUBLIC_LOGO?.trim() ??
    process.env.LOGO?.trim() ??
    '/images/logo.png';

  if (!logo) {
    return null;
  }

  return (
    <Link href="/">
      <Box
        className="Logo"
        sx={{
          backgroundPosition: fullWidth ? 'center' : 'left',
          backgroundImage: `url(${logo})`,
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
        }}
        width={fullWidth ? '100%' : width ? width : 100}
        height={{
          xs: 40,
          sm: 45,
        }}
        marginTop={1}
        marginBottom={0.5}
        display={{
          xs: fullWidth || showAlways ? 'inline-flex' : 'none',
          sm: 'inline-flex',
        }}
      />
    </Link>
  );
};

export default Logo;
