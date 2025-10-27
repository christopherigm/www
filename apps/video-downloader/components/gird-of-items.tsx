'use client';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import Pagination from '@mui/material/Pagination';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import AudioIcon from '@mui/icons-material/Audiotrack';
import YouTube from '@mui/icons-material/YouTube';
import Instagram from '@mui/icons-material/Instagram';
import Facebook from '@mui/icons-material/Facebook';
import X from '@mui/icons-material/X';
import HeadphonesIcon from '@mui/icons-material/Headphones';
import Pinterest from '@mui/icons-material/Pinterest';
import BlockIcon from '@mui/icons-material/Block';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DownloadIcon from '@mui/icons-material/Download';
import GridViewIcon from '@mui/icons-material/GridView';
import SettingsBackupRestoreIcon from '@mui/icons-material/SettingsBackupRestore';
import SplitscreenIcon from '@mui/icons-material/Splitscreen';
import ErrorIcon from '@mui/icons-material/Error';
import { signal } from '@preact-signals/safe-react';
import PaperCard from '@repo/ui/paper-card';
import Ribbon from '@repo/ui/ribbon';
import { searchText } from '@repo/ui/nav-bar/search';
import InnerSort from '@repo/helpers/inner-sort';
import { HourParser, DateParser } from '@repo/helpers/date-parser';
import isTidal from '@repo/helpers/is-tidal-checker';

import Item, { VideoType } from '@/classes/item';
import { ReactNode, useEffect, useState } from 'react';
import ReactPlayer from 'react-player';
import copy from 'copy-to-clipboard';
import Link from 'next/link';
import Snackbar from '@mui/material/Snackbar';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import Button from '@mui/material/Button';
import { system } from '@/classes/system';

type IconColorType = Record<VideoType, string>;
const iconColor: IconColorType = {
  audio: 'red',
  youtube: 'red',
  instagram: '#fbad50',
  facebook: '#1877F2',
  twitter: '#111',
  tiktok: '#111',
  pinterest: 'red',
  tidal: '#111',
};

type TikTokProps = {
  sx?: {
    color?: string;
  };
  color?: string;
  fontSize?: 'small' | 'medium' | 'large';
};

const TikTok = ({ sx, color, fontSize = 'medium' }: TikTokProps) => {
  return (
    <svg
      fill={sx?.color || color}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 50 50"
      width={fontSize === 'small' ? 20 : fontSize === 'medium' ? 24 : 28}
      height={fontSize === 'small' ? 20 : fontSize === 'medium' ? 24 : 28}
    >
      <path d="M41,4H9C6.243,4,4,6.243,4,9v32c0,2.757,2.243,5,5,5h32c2.757,0,5-2.243,5-5V9C46,6.243,43.757,4,41,4z M37.006,22.323 c-0.227,0.021-0.457,0.035-0.69,0.035c-2.623,0-4.928-1.349-6.269-3.388c0,5.349,0,11.435,0,11.537c0,4.709-3.818,8.527-8.527,8.527 s-8.527-3.818-8.527-8.527s3.818-8.527,8.527-8.527c0.178,0,0.352,0.016,0.527,0.027v4.202c-0.175-0.021-0.347-0.053-0.527-0.053 c-2.404,0-4.352,1.948-4.352,4.352s1.948,4.352,4.352,4.352s4.527-1.894,4.527-4.298c0-0.095,0.042-19.594,0.042-19.594h4.016 c0.378,3.591,3.277,6.425,6.901,6.685V22.323z" />
    </svg>
  );
};

type GridItemProps = {
  item: Item;
  onDeleteItem: () => void;
  onCancelItem: () => void;
  setOpen: () => void;
  miniMode: boolean;
  devMode: boolean;
  darkMode: boolean;
};

const GridItem = ({
  item,
  onDeleteItem,
  onCancelItem,
  setOpen,
  miniMode,
  devMode,
}: GridItemProps) => {
  const [expandName, setExpandName] = useState<boolean>(false);

  const actionButtons = (
    <>
      {item.status === 'ready' ||
      item.status === 'error' ||
      item.status === 'canceled' ? (
        <>
          <Box
            marginRight={miniMode ? 0 : 0.5}
            paddingRight={miniMode ? 0 : 0.5}
            borderRight={miniMode ? '' : 'solid 1px #666'}
          >
            <IconButton
              aria-label="delete"
              size="small"
              onClick={() => onDeleteItem()}
              color="error"
            >
              <DeleteIcon fontSize={miniMode ? 'small' : 'medium'} />
            </IconButton>
          </Box>
          <Box
            marginRight={
              miniMode || item.status === 'error' || item.status === 'canceled'
                ? 0
                : 0.5
            }
            paddingRight={
              miniMode || item.status === 'error' || item.status === 'canceled'
                ? 0
                : 0.5
            }
            borderRight={
              miniMode || item.status === 'error' || item.status === 'canceled'
                ? ''
                : 'solid 1px #666'
            }
          >
            <IconButton
              aria-label="re-download"
              size="small"
              onClick={() => item.getVideo()}
              color="default"
            >
              <SettingsBackupRestoreIcon
                fontSize={miniMode ? 'small' : 'medium'}
              />
            </IconButton>
          </Box>
        </>
      ) : null}
      {item.status === 'deleted' ? (
        <Box
          marginRight={miniMode ? 0 : 0.5}
          paddingRight={miniMode ? 0 : 0.5}
          borderRight={miniMode ? '' : 'solid 1px #666'}
        >
          <IconButton
            aria-label="delete"
            size="small"
            onClick={() => onDeleteItem()}
            color="error"
          >
            <DeleteIcon fontSize={miniMode ? 'small' : 'medium'} />
          </IconButton>
        </Box>
      ) : null}
      {item.videoLink && miniMode ? (
        <Box
          marginRight={miniMode ? 0 : 0.5}
          paddingRight={miniMode ? 0 : 0.5}
          borderRight={miniMode ? '' : 'solid 1px #666'}
        >
          <IconButton
            aria-label="download"
            size={miniMode ? 'small' : 'medium'}
            color="info"
            href={item.videoLink}
            download
          >
            <DownloadIcon fontSize={miniMode ? 'small' : 'medium'} />
          </IconButton>
        </Box>
      ) : null}
    </>
  );

  return (
    <PaperCard padding={0}>
      {item.name || item.error || item.status ? (
        <>
          <Box
            display="flex"
            justifyContent="space-between"
            justifyItems="center"
            alignItems="center"
            marginTop={1}
            paddingLeft={0.5}
            paddingRight={1.5}
          >
            <Box marginRight={0.8}>
              <IconButton
                aria-label="menu"
                size="small"
                onClick={() => setExpandName(!expandName)}
                color="default"
              >
                {expandName ? (
                  <CloseIcon fontSize="small" />
                ) : (
                  <MenuIcon fontSize="small" />
                )}
              </IconButton>
            </Box>
            <Box
              paddingLeft={1}
              borderLeft="solid 1px #666"
              display="flex"
              flexDirection="column"
              width="100%"
            >
              <Box
                display="flex"
                flexDirection="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography
                  variant={miniMode ? 'body2' : 'body1'}
                  height="auto"
                  noWrap={!expandName}
                  paddingRight={!expandName ? 4 : 0}
                >
                  {item.status === 'downloading' ? (
                    <>Downloading...</>
                  ) : item.status === 'ready' && isTidal(item.url) ? (
                    <>
                      {isTidal(item.url) && item.userFolder ? (
                        <>Stored in: {item.userFolder}</>
                      ) : null}
                    </>
                  ) : item.status === 'error' ? (
                    <>Error!</>
                  ) : item.status === 'canceled' ? (
                    <>Canceled</>
                  ) : item.status === 'processing-h264' ? (
                    <>Processing h264 video...</>
                  ) : item.status === 'deleted' ? (
                    <>Video deleted</>
                  ) : item.status === 'ready' && item.name ? (
                    <>{item.name}</>
                  ) : (
                    <>Processing...</>
                  )}
                </Typography>
                {item.status === 'error' || item.status === 'canceled' ? (
                  <Box display="flex" flexDirection="row">
                    {actionButtons}
                  </Box>
                ) : null}
                {item.status === 'downloading' ||
                item.status === 'none' ||
                item.status === 'processing-h264' ? (
                  <Box
                    paddingLeft={miniMode ? 0 : 0.5}
                    borderLeft={miniMode ? '' : 'solid 1px #666'}
                  >
                    <IconButton
                      aria-label="cancel"
                      size="small"
                      onClick={() => onCancelItem()}
                      color="error"
                    >
                      <BlockIcon fontSize={miniMode ? 'small' : 'medium'} />
                    </IconButton>
                  </Box>
                ) : null}
              </Box>
              {expandName ? (
                <>
                  {item.completedTime ? (
                    <>
                      <Box marginTop={1} marginBottom={1}>
                        <Divider />
                      </Box>
                      <Typography variant={miniMode ? 'body2' : 'body1'}>
                        Completed in: {item.completedTime}
                      </Typography>
                    </>
                  ) : null}
                  {item.userFolder ? (
                    <>
                      <Box marginTop={1} marginBottom={1}>
                        <Divider />
                      </Box>
                      <Typography variant={miniMode ? 'body2' : 'body1'}>
                        Folder: <b>{item.userFolder}</b>
                      </Typography>
                    </>
                  ) : null}
                  {item.nodeName ? (
                    <>
                      <Box marginTop={1} marginBottom={1}>
                        <Divider />
                      </Box>
                      <Typography variant={miniMode ? 'body2' : 'body1'}>
                        Processed in: <b>{item.nodeName}</b>
                      </Typography>
                    </>
                  ) : null}
                  {item.error ? (
                    <>
                      <Box marginTop={1} marginBottom={1}>
                        <Divider />
                      </Box>
                      <Typography
                        variant={miniMode ? 'body2' : 'body1'}
                        width={200}
                      >
                        Error: {item.error.toString()}
                      </Typography>
                    </>
                  ) : null}
                </>
              ) : null}
            </Box>
            <Box flexGrow={1}></Box>
            {item.hdTikTok && item.status === 'ready' ? (
              <Box width={50} marginRight={-2} marginTop={-1}>
                <Ribbon borderColor="#f4511e" color="#ff5722" text="h264" />
              </Box>
            ) : null}
          </Box>
        </>
      ) : null}

      {item.status === 'ready' && item.videoLink ? (
        <>
          <Box
            display="flex"
            justifyContent="center"
            maxWidth="100%"
            marginTop={1}
          >
            {item.status === 'ready' ? (
              <ReactPlayer
                src={item.videoLink}
                width="100%"
                height="auto"
                playing={false}
                controls
                loop
              />
            ) : null}
          </Box>
        </>
      ) : null}

      {item.type === 'tidal' && item.tidalEmbededLink ? (
        <>
          <Box marginTop={1}></Box>
          <iframe
            src={item.tidalEmbededLink}
            width="100%"
            height={
              item.tidalEmbededLink.search(/tracks/) > -1 && !miniMode
                ? 110
                : 250
            }
            allow="encrypted-media"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
            title="TIDAL Embed Player"
          />
        </>
      ) : null}

      {item.status !== 'ready' ? (
        <Box marginTop={1} marginBottom={1}>
          <Divider />
        </Box>
      ) : null}

      <Box
        display="flex"
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        marginTop={0.5}
        paddingLeft={0.5}
        paddingRight={1.5}
      >
        {item.type && item.url ? (
          <Box marginRight={1} paddingRight={0.8} borderRight="solid 1px #666">
            <Link href={item.url} target="_blank">
              <IconButton
                aria-label="link"
                size="small"
                sx={{
                  backgroundColor: 'white !important',
                  borderRadius: 3,
                  padding: 0.4,
                }}
              >
                {item.justAudio || item.type === 'audio' ? (
                  <AudioIcon
                    fontSize={miniMode ? 'small' : 'medium'}
                    sx={{ color: iconColor.audio }}
                  />
                ) : item.type === 'tidal' ? (
                  <HeadphonesIcon
                    fontSize={miniMode ? 'small' : 'medium'}
                    sx={{ color: iconColor.tidal }}
                  />
                ) : item.type === 'youtube' ? (
                  <YouTube
                    fontSize={miniMode ? 'small' : 'medium'}
                    sx={{ color: iconColor.youtube }}
                  />
                ) : item.type === 'instagram' ? (
                  <Instagram
                    fontSize={miniMode ? 'small' : 'medium'}
                    sx={{ color: iconColor.instagram }}
                  />
                ) : item.type === 'facebook' ? (
                  <Facebook
                    fontSize={miniMode ? 'small' : 'medium'}
                    sx={{ color: iconColor.facebook }}
                  />
                ) : item.type === 'twitter' ? (
                  <X
                    fontSize={miniMode ? 'small' : 'medium'}
                    sx={{ color: iconColor.twitter }}
                  />
                ) : item.type === 'tiktok' ? (
                  <TikTok
                    fontSize={miniMode ? 'small' : 'medium'}
                    sx={{ color: iconColor.tiktok }}
                  />
                ) : item.type === 'pinterest' ? (
                  <Pinterest
                    fontSize={miniMode ? 'small' : 'medium'}
                    sx={{ color: iconColor.pinterest }}
                  />
                ) : null}
              </IconButton>
            </Link>
          </Box>
        ) : null}
        {item.url ? (
          <Typography variant="body2" noWrap={true}>
            <Link href={item.url} target="_blank">
              {item.url}
            </Link>
          </Typography>
        ) : null}

        <Box marginLeft={1} paddingLeft={1} borderLeft="solid 1px #666">
          <IconButton
            aria-label="copy"
            size="small"
            onClick={() => {
              copy(item.url);
              setOpen();
            }}
          >
            <ContentCopyIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
      {item.status === 'ready' && item.videoLink ? (
        // item.status === 'error' ||
        // item.status === 'canceled'
        <>
          <Box marginTop={1} marginBottom={1}>
            <Divider />
          </Box>
          <Box
            display="flex"
            flexDirection="row"
            justifyContent={item.resourceDownloaded ? 'space-between' : 'end'}
            alignItems="center"
            marginTop={1}
            paddingLeft={0.5}
            paddingRight={1.5}
          >
            {actionButtons}
            {!miniMode && item.videoLink ? (
              <>
                <Box flexGrow={1}></Box>
                <Button
                  variant="contained"
                  sx={{
                    textTransform: 'initial',
                  }}
                  href={item.videoLink}
                  download
                >
                  Download
                </Button>
              </>
            ) : null}
          </Box>
        </>
      ) : null}
      {item.processingStatus && item.url ? (
        <>
          <Box marginTop={1} marginBottom={1}>
            <Divider />
          </Box>
          <Box
            display="flex"
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
            marginTop={1}
            paddingLeft={1.5}
            paddingRight={1.5}
          >
            <Typography variant="body2">
              <Link href={item.url} target="_blank">
                {item.processingStatus}
              </Link>
            </Typography>
          </Box>
        </>
      ) : null}

      {devMode ? (
        <>
          <Box marginTop={1} marginBottom={1}>
            <Divider />
          </Box>
          <Box
            display="flex"
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="body2" noWrap={true}>
              ID: {item.id}
            </Typography>
            <Box marginLeft={1} paddingLeft={1} borderLeft="solid 1px #666">
              <IconButton
                aria-label="copy"
                size="small"
                onClick={() => copy(item.id)}
                color="default"
              >
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
          <>
            <Box marginTop={1} marginBottom={1}>
              <Divider />
            </Box>
            <Box display="flex" marginTop={1}>
              <Typography variant="body2" noWrap={true}>
                <b>Status:</b> {item.status}
              </Typography>
            </Box>
          </>
          {item.created ? (
            <>
              <Box marginTop={1} marginBottom={1}>
                <Divider />
              </Box>
              <Box display="flex" marginTop={1}>
                <Typography variant="body2" noWrap={true}>
                  {DateParser(item.created.toString())} -{' '}
                  {HourParser(item.created.toString())}
                </Typography>
              </Box>
            </>
          ) : null}
          <>
            <Box marginTop={1} marginBottom={1}>
              <Divider />
            </Box>
            <Box display="flex" marginTop={1}>
              <Typography variant="body2" noWrap={false}>
                <b>Filename:</b> {item.filename}
              </Typography>
            </Box>
          </>
          {item.videoLink ? (
            <>
              <Box marginTop={1} marginBottom={1}>
                <Divider />
              </Box>
              <Box display="flex" marginTop={1}>
                <Typography variant="body2" noWrap={false}>
                  {item.videoLink}
                </Typography>
              </Box>
            </>
          ) : null}
          <>
            <Box marginTop={1} marginBottom={1}>
              <Divider />
            </Box>
            <Box display="flex" marginTop={1}>
              <Typography variant="body2" noWrap={true}>
                <b>URLBase:</b> {item.URLBase}
              </Typography>
            </Box>
          </>
        </>
      ) : null}
      <Box height={10}></Box>
    </PaperCard>
  );
};

type FilterButtonProps = {
  children: ReactNode;
  videoType: VideoType;
  darkMode: boolean;
};

const FilterButton = ({ children, videoType, darkMode }: FilterButtonProps) => {
  const selected = filterTypes.value.indexOf(videoType) > -1;
  const color = selected
    ? darkMode
      ? 'white'
      : iconColor[videoType]
    : darkMode
      ? '#999'
      : '#000';
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      marginRight={1}
      padding={0.5}
      marginBottom={1}
      onClick={() => {
        const index = filterTypes.value.indexOf(videoType);
        if (index > -1) {
          filterTypes.value.splice(index, 1);
          filterTypes.value = [...filterTypes.value];
        } else {
          filterTypes.value.push(videoType);
          filterTypes.value = [...filterTypes.value];
        }
      }}
      sx={{
        cursor: 'pointer',
        opacity: selected ? '1' : '0.7',
        color: color,
        fill: color,
        backgroundColor: 'white !important',
        borderRadius: 3,
      }}
    >
      {children}
    </Box>
  );
};

const miniGrid = signal(false);
const itemsToDisplay = signal(6);
const page = signal(1);
const offset = signal(0);
const filterTypes = signal<Array<VideoType>>([]);
const filterByErrors = signal<boolean>(false);
const filteredItems = signal<Array<Item>>([]);

const GridOfItems = () => {
  const [open, setOpen] = useState(false);
  system.value.filterForItems = searchText.value;
  offset.value = (page.value - 1) * itemsToDisplay.value;
  filteredItems.value = system.value.items
    .filter((i) => {
      if (!filterTypes.value.length) {
        return i;
      }
      if (i.type && filterTypes.value.indexOf(i.type) > -1) {
        return i;
      }
    })
    .filter((i) => {
      if (!filterByErrors.value) {
        return i;
      } else if (i.status === 'error') {
        return i;
      }
    })
    .sort(InnerSort('_created', 'desc'));

  useEffect(() => {
    page.value = 1;
    filterTypes.value = [];
    system.value.getItemsFromLocalStorage();
  }, []);

  if (!system.value.items.length) {
    return null;
  }

  return (
    <Box display="flex" flexDirection="column">
      <Box display="flex" flexDirection="row" justifyContent="space-between">
        <Box
          display="flex"
          flexDirection="row"
          alignItems="center"
          flexWrap="wrap"
        >
          {system.value.items.filter((i) => i.justAudio).length ? (
            <FilterButton videoType="audio" darkMode={system.value.darkMode}>
              <AudioIcon />
            </FilterButton>
          ) : null}
          {system.value.items.filter((i) => i.type && i.type === 'youtube')
            .length ? (
            <FilterButton videoType="youtube" darkMode={system.value.darkMode}>
              <YouTube />
            </FilterButton>
          ) : null}
          {system.value.items.filter((i) => i.type && i.type === 'instagram')
            .length ? (
            <FilterButton
              videoType="instagram"
              darkMode={system.value.darkMode}
            >
              <Instagram />
            </FilterButton>
          ) : null}
          {system.value.items.filter((i) => i.type && i.type === 'tiktok')
            .length ? (
            <FilterButton videoType="tiktok" darkMode={system.value.darkMode}>
              <TikTok />
            </FilterButton>
          ) : null}
          {system.value.items.filter((i) => i.type && i.type === 'facebook')
            .length ? (
            <FilterButton videoType="facebook" darkMode={system.value.darkMode}>
              <Facebook />
            </FilterButton>
          ) : null}
          {system.value.items.filter((i) => i.type && i.type === 'twitter')
            .length ? (
            <FilterButton videoType="twitter" darkMode={system.value.darkMode}>
              <X />
            </FilterButton>
          ) : null}
        </Box>
        <Box display="flex" flexDirection="row">
          <Box marginRight={1}>
            <FormControl fullWidth>
              <InputLabel id="demo-simple-select-label">Items</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                size="small"
                value={String(itemsToDisplay.value)}
                label="Items"
                onChange={(e: SelectChangeEvent) => {
                  itemsToDisplay.value = Number(e.target.value);
                  page.value = 1;
                }}
              >
                <MenuItem value={1}>1</MenuItem>
                <MenuItem value={6}>6</MenuItem>
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={20}>20</MenuItem>
              </Select>
            </FormControl>
          </Box>
          {system.value.items.filter((i) => i.type && i.status === 'error')
            .length ? (
            <Box>
              <IconButton
                aria-label="filterByErrors"
                size="medium"
                onClick={() => (filterByErrors.value = !filterByErrors.value)}
                sx={{
                  opacity: filterByErrors.value ? '1' : '0.7',
                  backgroundColor: filterByErrors.value ? '#333' : '',
                  color: filterByErrors.value ? 'white' : '#000',
                }}
              >
                <ErrorIcon />
              </IconButton>
            </Box>
          ) : null}
          <Box marginRight={1}>
            <IconButton
              aria-label="miniGrid"
              size="medium"
              onClick={() => (miniGrid.value = !miniGrid.value)}
              color="default"
            >
              {miniGrid.value ? <SplitscreenIcon /> : <GridViewIcon />}
            </IconButton>
          </Box>
        </Box>
      </Box>
      {system.value.devMode ? (
        <>
          <Box>
            <Typography variant="body2" color="white">
              Items length: {system.value.items.length}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="white">
              Filtered Items: {filteredItems.value.length}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="white">
              Items To Display: {itemsToDisplay.value}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="white">
              Page: {page.value}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="white">
              Offset: {offset.value}
            </Typography>
          </Box>
        </>
      ) : null}
      <Grid
        container
        columnSpacing={1}
        rowSpacing={3}
        // padding={1}
        marginTop={0}
      >
        {filteredItems.value
          .slice(offset.value, offset.value + itemsToDisplay.value)
          .map((i: Item, index: number) => (
            <Grid
              size={{
                xs: miniGrid.value ? 6 : 12,
                sm: miniGrid.value ? 4 : 6,
                md: miniGrid.value ? 3 : 4,
              }}
              key={index}
              padding={0}
            >
              <GridItem
                item={i}
                onDeleteItem={() => system.value.deleteItem(i.id)}
                onCancelItem={() => i.cancelRequest()}
                setOpen={() => setOpen(true)}
                miniMode={miniGrid.value}
                devMode={system.value.devMode}
                darkMode={system.value.darkMode}
              />
            </Grid>
          ))}
      </Grid>
      {system.value.items.length &&
      filteredItems.value.length > itemsToDisplay.value ? (
        <>
          <Box marginTop={2} marginBottom={1}>
            <Divider />
          </Box>
          <Box display="flex" justifyContent="center">
            <Pagination
              count={Math.round(
                filteredItems.value.length / itemsToDisplay.value
              )}
              color="primary"
              page={page.value}
              onChange={(_e: React.ChangeEvent<unknown>, value: number) =>
                (page.value = value)
              }
            />
          </Box>
        </>
      ) : null}
      <Box marginTop={3} />
      <Snackbar
        open={open}
        onClose={() => setOpen(false)}
        autoHideDuration={2000}
        message="Link copied to clipboard"
      />
    </Box>
  );
};

export default GridOfItems;
