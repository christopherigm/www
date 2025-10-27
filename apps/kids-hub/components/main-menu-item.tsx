import React, { ReactNode } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import Link from 'next/link';

type Props = {
  title: string;
  href: string;
  icon: ReactNode;
};

const MainMenuItem = ({ icon, title, href }: Props) => {
  return (
    <Grid size={{ xs: 6, sm: 4, lg: 3, xl: 2 }}>
      <Paper elevation={1}>
        <Link href={href}>
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="space-evenly"
            height={110}
          >
            {icon}
            <Typography variant="h6" align="center">
              {title}
            </Typography>
          </Box>
        </Link>
      </Paper>
    </Grid>
  );
};

export default MainMenuItem;
