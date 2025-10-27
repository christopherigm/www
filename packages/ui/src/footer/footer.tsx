import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import GitHubIcon from '@mui/icons-material/GitHub';
import type MetaTagsProps from '@repo/interfaces/meta-tags-props';
import ThemeModeButtons from '../theme-mode-buttons';

const Footer = ({
  children,
  version = '',
  github = '',
  primaryColor,
  language = 'en',
  footerBGColor,
  darkFooter = false,
}: MetaTagsProps) => {
  const verticalDivisor = (
    <Box
      height={20}
      marginLeft={1}
      marginRight={1}
      borderLeft="1px solid white"
    ></Box>
  );

  return (
    <Box
      bgcolor={footerBGColor !== '' ? footerBGColor : primaryColor}
      boxShadow={{
        sx: '',
        md: '0px -3px 5px rgba(0,0,0,0.5)',
      }}
    >
      <Container maxWidth="lg">
        <footer
          style={{
            padding: '10px 0',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            ...(darkFooter && { color: 'white' }),
          }}
        >
          <Typography variant="body2">{version}</Typography>
          {verticalDivisor}
          <Box
            display={{
              xs: 'none',
              sm: 'initial',
            }}
          >
            <Link href="/terms-and-conditions">
              <Typography variant="body2">
                {language === 'en'
                  ? 'Terms and Conditions'
                  : 'Terminos y condiciones'}
              </Typography>
            </Link>
          </Box>
          {children ?? null}
          {github ? (
            <Box
              display={{
                xs: 'none',
                sm: 'flex',
              }}
              alignItems="center"
            >
              {verticalDivisor}
              <IconButton aria-label="github" href={github}>
                <GitHubIcon />
              </IconButton>
            </Box>
          ) : null}
          <Box flexGrow={1}></Box>
          <Box
            display={{
              xs: 'none',
              sm: 'initial',
            }}
            padding={0.4}
            borderRadius={1}
            bgcolor="white"
          >
            <ThemeModeButtons
              mini={true}
              fullWidth={false}
              language={language}
            />
          </Box>
          {github ? (
            <Box
              display={{
                xs: 'flex',
                sm: 'none',
              }}
              alignItems="center"
            >
              <IconButton aria-label="github" href={github}>
                <GitHubIcon />
              </IconButton>
            </Box>
          ) : null}
        </footer>
      </Container>
    </Box>
  );
};

export default Footer;
