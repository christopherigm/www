import React from 'react';
import Grid from '@mui/material/Grid';
import MainMenuItem from '@/components/main-menu-item';

import WorkspacesIcon from '@mui/icons-material/Workspaces';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const Page = () => {
  // const env = GetEnvVariables();

  return (
    <Grid container spacing={2} marginTop={2}>
      <MainMenuItem
        title="Clock"
        href="/clock"
        icon={<AccessTimeIcon fontSize="large" />}
      />
      <MainMenuItem
        title="Multiplications"
        href="/multiplications"
        icon={<WorkspacesIcon fontSize="large" />}
      />
    </Grid>
  );
};

export default Page;
