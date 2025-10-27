'use client';

import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import { useState, useRef, FormEvent } from 'react';
import { signal } from '@preact-signals/safe-react';
import SearchIcon from '@mui/icons-material/Search';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import Languages from '@repo/interfaces/languages';
import { useTheme } from '@mui/material';

export const searchText = signal<string>('');
export const searchTextSubmit = signal<string>('');

type Props = {
  language: Languages;
  darkNavBar: boolean;
};

const Search = ({ language = 'en', darkNavBar = false }: Props) => {
  const theme = useTheme();
  const searchRef = useRef<HTMLInputElement>(null);
  const [toggleSearchBar, setToggleSearchBar] = useState<boolean>(false);
  const [showInput, setShowInput] = useState<boolean>(false);

  const handleSearchSubmit = () => {
    if (searchRef && searchRef.current) {
      searchRef.current.getElementsByTagName('input')[0]?.blur();
    }
  };

  const toggle = () => {
    setToggleSearchBar(!toggleSearchBar);
    if (toggleSearchBar) {
      setShowInput(!showInput);
    } else {
      setTimeout(
        () => setShowInput(!showInput),
        theme.palette.mode !== 'dark' ? 500 : 0
      );
    }
  };

  const searchBar = (
    <Box
      display="inline-flex"
      alignItems="center"
      justifyContent="end"
      bgcolor={theme.palette.mode !== 'dark' && darkNavBar ? 'white' : ''}
      borderRadius={toggleSearchBar ? 10 : 30}
      paddingLeft={toggleSearchBar ? 2 : 0}
      marginLeft={1}
      width={toggleSearchBar ? 270 : 42}
      boxShadow={toggleSearchBar ? '0px 0px 10px rgba(0,0,0,0.2)' : '0px'}
      overflow="hidden"
      sx={{
        transition: theme.palette.mode !== 'dark' ? 'all ease 0.5s' : '',
      }}
    >
      {toggleSearchBar ? (
        <Box
          component="form"
          onSubmit={(e: FormEvent) => {
            e.preventDefault();
            handleSearchSubmit();
          }}
        >
          {showInput ? (
            <TextField
              ref={searchRef}
              label={language === 'en' ? 'Search' : 'Buscar'}
              variant="standard"
              size="small"
              type="search"
              name="search"
              autoComplete="none"
              autoSave="none"
              value={searchText.value}
              onSubmit={() => handleSearchSubmit()}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const value = e.target.value ?? '';
                searchText.value = value;
              }}
              sx={{
                width: '100%',
                // label: {
                //   color: 'black',
                // },
                // input: {
                //   color: 'black',
                // },
              }}
            />
          ) : null}
        </Box>
      ) : (
        <IconButton
          type="button"
          aria-label="search"
          onClick={() => {
            toggle();
            searchText.value = '';
            if (searchRef && searchRef.current) {
              searchRef.current.getElementsByTagName('input')[0]?.focus();
            }
          }}
        >
          <SearchIcon htmlColor="#777" />
        </IconButton>
      )}
      {toggleSearchBar ? (
        <IconButton
          type="button"
          sx={{ p: '10px', marginLeft: 1 }}
          aria-label="close"
          onClick={() => {
            toggle();
            searchText.value = '';
          }}
        >
          <SearchOffIcon htmlColor="#777" />
        </IconButton>
      ) : null}
    </Box>
  );

  return {
    searchBar,
    isSearchBarOpen: toggleSearchBar,
  };
};

export default Search;
