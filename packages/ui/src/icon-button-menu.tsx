'use client';

import React, { ReactElement, ReactNode } from 'react';
import IconButton from '@mui/material/IconButton';

import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

type Item = {
  text: string;
  icon: ReactElement | ReactNode;
  onClick: () => void;
};

type Props = {
  items: Array<Item>;
  isLoading?: boolean;
  backgroundColor?: string;
  size?: 'small' | 'medium' | 'large';
};

const IconButtonMenu = ({
  items = [],
  isLoading = false,
  backgroundColor,
  size = 'small',
}: Props) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton
        id="basic-button"
        aria-controls={open ? 'basic-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        disabled={isLoading}
        onClick={handleClick}
        style={{
          width: size === 'small' ? 35 : 40,
          height: size === 'small' ? 35 : 40,
          boxShadow: '0px 0px 5px rgba(13, 13, 13, 0.24)',
          backgroundColor,
        }}
      >
        <MoreVertIcon fontSize={size} />
      </IconButton>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        slotProps={{
          list: {
            'aria-labelledby': 'basic-button',
          },
        }}
      >
        {items.map((item: Item, index: number) => {
          return (
            <MenuItem
              key={index}
              onClick={() => {
                item.onClick();
                setAnchorEl(null);
              }}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                width: '100%',
              }}
              disabled={isLoading}
            >
              <Typography variant="body1">{item.text}</Typography>
              <Box width={10} />
              {item.icon}
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
};

export default IconButtonMenu;
