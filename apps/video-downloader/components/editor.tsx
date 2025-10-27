'use client';

import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import LinearProgress from '@mui/material/LinearProgress';
import { Signal, signal } from '@preact-signals/safe-react';
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react';
import type { APIError } from '@repo/interfaces/api-error-handler';
import Dialog from '@repo/ui/dialog';
import type Languages from '@repo/interfaces/languages';
import isIOSBrowser from '@repo/helpers/is-ios-browser-check';
import GetBrowserLanguage from '@repo/ui/get-browser-language';

import { system } from '@/classes/system';
import Button from '@mui/material/Button';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Song from '@/classes/song';
import GridOfSongs from '@/components/grid-of-songs';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import {
  Chip,
  IconButton,
  Pagination,
  Radio,
  RadioGroup,
  Slider,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';

import TextInput from '@repo/ui/generic-text-input';

const autoDownload: Signal<boolean> = signal(true);
const dialogOpen: Signal<boolean> = signal(false);
const currentSong: Signal<Song> = signal(new Song());

type CheckBoxChipProps = {
  label: string;
  checked: boolean;
  onClick: () => void;
  disabled?: boolean;
};
const CheckBoxChip = ({
  label = '',
  checked = false,
  onClick,
  disabled = false,
}: CheckBoxChipProps) => {
  return (
    <Chip
      label={label}
      color={checked ? 'primary' : 'default'}
      variant={checked ? 'filled' : 'outlined'}
      onClick={onClick}
      disabled={disabled}
      sx={{ margin: 0.5, fontSize: '1em' }}
    />
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const EditorForm = (props: any) => {
  const { browserLanguage } = GetBrowserLanguage();
  const [useAIForLyrics, setUseAIForLyrics] = useState<boolean>(true);
  const [onlineSongs, setOnlineSongs] = useState<boolean>(false);
  const [showRimer, setShowRimer] = useState<boolean>(false);
  const topRef = useRef<HTMLElement>(null);
  const [itemsToDisplay, setItemsToDisplay] = useState<number>(5);
  const [page, setPage] = useState<number>(1);
  const songs = onlineSongs ? system.value.onlineSongs : system.value.songs;
  const offset = (page - 1) * itemsToDisplay;
  const songsToRender: Array<Song> = songs.slice(
    offset,
    offset + itemsToDisplay
  );

  const [errors, setErrors] = useState<APIError>({
    message: '',
    code: '',
    status: 0,
  });

  useEffect(() => {}, [system.value.songs, system.value.onlineSongs]);

  // useEffect(() => {
  //   currentSong.value.songStyleBoost =
  //     currentSong.value.compiled_style.length ||
  //     currentSong.value.songStyle.length
  //       ? true
  //       : false;
  // }, [currentSong.value.compiled_style, currentSong.value.songStyle]);

  useEffect(() => {
    currentSong.value.language = browserLanguage;
    system.value.setDataFromPlainObject(props);
    system.value.getSongsFromLocalStorage();
    const isOS = isIOSBrowser();
    autoDownload.value = !isOS;
    currentSong.value = new Song();
  }, [props]);

  const resetForms = () => {
    currentSong.value = new Song();
  };

  const handleError = (message: string) => {
    setErrors({
      ...errors,
      message,
    });
  };

  const handleSubmitGenerateLyrics = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    currentSong.value.getLyric().catch((e) => handleError(e));
  };

  const handleSubmitGenerateSong = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    system.value.isLoading = true;
    if (currentSong.value.songStyle.length > 299) {
      currentSong.value.songStyle.substring(0, 299);
    }
    system.value
      .addSong(currentSong.value.getSongToSaveInLocalStorage())
      .then(() => {
        resetForms();
        if (!dialogOpen.value) {
          dialogOpen.value = true;
        }
      })
      .catch((e) => handleError(e))
      .finally(() => (system.value.isLoading = false));
  };

  const RetrySong = (song: Song) => {
    system.value.isLoading = true;
    system.value
      .addSong(song.getSongToSaveInLocalStorage())
      .then(() => {
        // resetForms(); ///////// check!
        if (!dialogOpen.value) {
          dialogOpen.value = true;
        }
      })
      .catch((e) => handleError(e))
      .finally(() => (system.value.isLoading = false));
  };

  const Divisor = () => <Box height={15}></Box>;

  const LLMLyricsForm = (
    <Box
      display="flex"
      flexDirection="column"
      component="form"
      noValidate={false}
      autoComplete="on"
      onSubmit={handleSubmitGenerateLyrics}
      padding={2}
    >
      <FormControl fullWidth>
        <InputLabel id="language-select-label">
          {currentSong.value.language === 'en'
            ? 'Song language'
            : 'Idioma de la cancion'}
        </InputLabel>
        <Select
          labelId="language-select-label"
          id="language-select"
          value={currentSong.value.language}
          label={
            currentSong.value.language === 'en'
              ? 'Song language'
              : 'Idioma de la cancion'
          }
          onChange={(e) =>
            (currentSong.value.language = e.target.value as Languages)
          }
          size="small"
        >
          <MenuItem value={'en'}>English</MenuItem>
          <MenuItem value={'es'}>Español</MenuItem>
        </Select>
      </FormControl>
      <Divisor />
      <Typography variant="subtitle1" fontWeight="bold">
        {currentSong.value.language === 'en'
          ? '1.- Give a name to your song'
          : '1.- Nombra a tu cancion'}
      </Typography>
      <Divisor />
      <TextField
        label={
          currentSong.value.language === 'en'
            ? 'Song name'
            : 'Nombre de la cancion'
        }
        variant="outlined"
        size="small"
        type="text"
        name="name"
        autoComplete="none"
        autoSave="none"
        disabled={currentSong.value.isLoading || system.value.isLoading}
        value={currentSong.value.name}
        onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
          (currentSong.value.name = e.target.value)
        }
        sx={{
          flexGrow: 1,
        }}
        required
      />
      <Divisor />
      <FormGroup>
        <FormControlLabel
          control={
            <Switch
              value={useAIForLyrics}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                setUseAIForLyrics(event.target.checked);
              }}
              defaultChecked
            />
          }
          label={
            currentSong.value.language === 'en'
              ? 'Use AI to generate lyrics'
              : 'Usar IA para generar letras'
          }
          disabled={currentSong.value.isLoading || system.value.isLoading}
        />
      </FormGroup>
      <Divisor />
      {useAIForLyrics ? (
        <>
          <Typography variant="subtitle1" fontWeight="bold">
            {currentSong.value.language === 'en'
              ? '2.- AI Lyric generator'
              : '2.- Generador de letras con IA'}
          </Typography>
          <Typography variant="body1">
            {currentSong.value.language === 'en'
              ? 'Write a detailed idea to generate lyrics for a song with Artificial Intelligence. Include as much details as you can about the subject and the story.'
              : 'Escribe una idea detallada para generar las letras de la cancion con Inteligencia Artificial. Incluye tanto detalle como sea posible acerca de los personajes y la historia.'}
          </Typography>
          <Divisor />
          <TextField
            label={
              currentSong.value.language === 'en'
                ? 'Lyrics prompt'
                : 'Idea para la letra'
            }
            placeholder={
              currentSong.value.language === 'en'
                ? 'A dog playing with a ball on the garden'
                : 'Un perrito jugando con una pelota en el Jardin'
            }
            variant="outlined"
            size="small"
            type="text"
            name="prompt"
            autoComplete="none"
            autoSave="none"
            multiline={true}
            rows={10}
            disabled={currentSong.value.isLoading || system.value.isLoading}
            style={{ width: '100%' }}
            value={currentSong.value.prompt}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
              (currentSong.value.prompt = e.target.value)
            }
            required
          />
          <Divisor />
          <TextField
            label={
              currentSong.value.language === 'en'
                ? 'Words to exclude'
                : 'Palabras a excluir'
            }
            variant="outlined"
            size="small"
            type="text"
            name="negativePrompt"
            autoComplete="none"
            autoSave="none"
            multiline={true}
            rows={2}
            disabled={currentSong.value.isLoading || system.value.isLoading}
            style={{ width: '100%' }}
            value={currentSong.value.negativePrompt}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
              (currentSong.value.negativePrompt = e.target.value)
            }
          />
          <Divisor />
          <TextField
            label={
              currentSong.value.language === 'en'
                ? 'Reference (optional)'
                : 'Referencia (opcional)'
            }
            variant="outlined"
            size="small"
            type="text"
            name="songReference"
            autoComplete="none"
            autoSave="none"
            multiline={true}
            rows={3}
            disabled={currentSong.value.isLoading || system.value.isLoading}
            style={{ width: '100%' }}
            value={currentSong.value.songReference}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              currentSong.value.songReference = e.target.value;
            }}
          />
          <Divisor />
          <Typography variant="subtitle1" fontWeight="bold">
            {currentSong.value.language === 'en'
              ? '3.- Lyrics style (optional)'
              : '3.- Estilo de la letra (opcional)'}
          </Typography>
          <Typography variant="body1">Pop, Rock, Rap, Salsa etc.</Typography>
          <Divisor />
          <TextField
            label={
              currentSong.value.language === 'en'
                ? 'Lyrics style (optional)'
                : 'Estilo de la letra (opcional)'
            }
            variant="outlined"
            size="small"
            type="text"
            name="lyricsStyle"
            autoComplete="none"
            autoSave="none"
            multiline={true}
            rows={3}
            disabled={currentSong.value.isLoading || system.value.isLoading}
            style={{ width: '100%' }}
            value={currentSong.value.lyricsStyle}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              currentSong.value.lyricsStyle = e.target.value;
            }}
          />

          <Divisor />
          <Typography variant="subtitle1" fontWeight="bold">
            {currentSong.value.language === 'en'
              ? '4.- Lyrics emotions (optional)'
              : '4.- Emociones de la letra (opcional)'}
          </Typography>
          <Divisor />
          <TextInput
            language={currentSong.value.language}
            label={{
              en: 'Emotions',
              es: 'Emociones',
            }}
            placeholder={{
              en: 'Happyness, Nostalgic, Joy, Sadness',
              es: 'Felicidad, Nostalgia, Alegria, Tristeza',
            }}
            type="url"
            value={currentSong.value.lyricsEmotions}
            onChange={(value) => (currentSong.value.lyricsEmotions = value)}
            disabled={currentSong.value.isLoading || system.value.isLoading}
            multiline={true}
            rows={3}
          />
          <Divisor />
          <Typography variant="subtitle1" fontWeight="bold">
            {currentSong.value.language === 'en'
              ? 'Lyrics length'
              : 'Largo de la letra'}
          </Typography>
          <Divisor />
          <Box paddingX={2}>
            <Slider
              aria-label="Length"
              defaultValue={currentSong.value.lyricsLength}
              marks={[
                {
                  value: 1,
                  label: 'Corta',
                },
                {
                  value: 2,
                  label: 'Media',
                },
                {
                  value: 3,
                  label: 'Larga',
                },
              ]}
              valueLabelDisplay="auto"
              step={1}
              min={1}
              max={3}
              onChange={(_e, value) =>
                (currentSong.value.lyricsLength = Number(value))
              }
              color={
                currentSong.value.lyricsLength === 1
                  ? 'warning'
                  : currentSong.value.lyricsLength === 2
                    ? 'success'
                    : 'primary'
              }
              disabled={currentSong.value.isLoading || system.value.isLoading}
            />
          </Box>
          <Divisor />

          <Box display="flex" justifyContent="space-between">
            <Button
              variant="contained"
              color="inherit"
              sx={{ textTransform: 'initial' }}
              onClick={() => {
                currentSong.value.name = '';
                currentSong.value.prompt = '';
                currentSong.value.lyricsStyle = '';
              }}
              disabled={currentSong.value.isLoading || system.value.isLoading}
            >
              {currentSong.value.language === 'en' ? 'Clear' : 'Limpiar'}
            </Button>
            <Button
              variant="contained"
              sx={{
                textTransform: 'initial',
              }}
              type="submit"
              disabled={
                currentSong.value.isLoading ||
                system.value.isLoading ||
                !currentSong.value.name ||
                !currentSong.value.prompt
              }
              loading={currentSong.value.isLoading || system.value.isLoading}
              loadingPosition="end"
            >
              {currentSong.value.language === 'en'
                ? 'Generate lyrics!'
                : 'Generar letra!'}
            </Button>
          </Box>
        </>
      ) : null}
      {currentSong.value.isLoading || system.value.isLoading ? (
        <Box
          width="100%"
          marginTop={2}
          display={{
            xs: 'block',
            md: 'none',
          }}
        >
          <LinearProgress />
        </Box>
      ) : null}
    </Box>
  );

  const SongForm = (
    <Box
      display="flex"
      flexDirection="column"
      component="form"
      noValidate={false}
      autoComplete="on"
      onSubmit={handleSubmitGenerateSong}
      padding={2}
    >
      <Typography variant="subtitle1" fontWeight="bold">
        {useAIForLyrics ? '4.- ' : '2.- '}
        {currentSong.value.language === 'en'
          ? 'Song lyrics'
          : 'Letra para la cancion'}
      </Typography>
      {useAIForLyrics ? (
        <Typography variant="body1">
          {currentSong.value.language === 'en'
            ? 'Review and/or change the lyrics if you want to generate the song. Lyrics cannot exceed 5,000 words lenght.'
            : 'Revisa y/o cambia si lo deseas las letras para generar la cacion. Las letras no pueden exceder 5,000 palabras.'}
        </Typography>
      ) : (
        <Typography variant="body1">
          {currentSong.value.language === 'en'
            ? 'Write the lyrics for the new song. Lyrics cannot exceed 5,000 words lenght.'
            : 'Escribe la letra para la nueva cancion. Las letras no pueden exceder 5,000 palabras.'}
        </Typography>
      )}
      <Divisor />
      <TextField
        label={currentSong.value.language === 'en' ? 'Lyrics' : 'Letra'}
        variant="outlined"
        size="small"
        type="text"
        name="llmLyrics"
        autoComplete="none"
        autoSave="none"
        multiline={true}
        rows={10}
        disabled={currentSong.value.isLoading || system.value.isLoading}
        style={{ width: '100%' }}
        value={currentSong.value.llmLyrics}
        onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
          (currentSong.value.llmLyrics = e.target.value)
        }
        required
      />
      {showRimer ? (
        <>
          <Divisor />
          <iframe
            title="Rimar"
            width="100%"
            height="300"
            src="https://rimar.io/"
          ></iframe>
        </>
      ) : null}
      <Divisor />
      <FormGroup>
        <FormControlLabel
          control={
            <Switch
              value={showRimer}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                setShowRimer(event.target.checked)
              }
            />
          }
          label={
            currentSong.value.language === 'en'
              ? 'Show rhyme tool'
              : 'Mostrar herramienta de rimas'
          }
          disabled={currentSong.value.isLoading || system.value.isLoading}
        />
      </FormGroup>
      {currentSong.value.llmLyrics.length > 4999 ? (
        <>
          <Divisor />

          <Typography variant="body1" color="error" fontWeight="bold">
            {currentSong.value.language === 'en'
              ? 'Error: Lyrics cannot exceed 5,000 words lenght.'
              : 'Error: Las letras no pueden exceder 5,000 palabras.'}
          </Typography>
        </>
      ) : null}
      <Divisor />
      <Typography variant="subtitle1" fontWeight="bold">
        {useAIForLyrics ? '5.- ' : '3.- '}
        {currentSong.value.language === 'en'
          ? 'Song style'
          : 'Estilo de la cancion'}
      </Typography>
      <Typography variant="body1">
        {currentSong.value.language === 'en'
          ? 'Write the style of the song, you can also define multiple comma separated styles. '
          : 'Escribe el estilo de la cancion, tambien puedes definir multiples estilos separados por coma. '}
        Pop, Rock, Rap, Salsa etc.
        {currentSong.value.language === 'en'
          ? ' Or a combiation like: "Rock, Pop, Metal"'
          : ' O una combinacion como: "Rock, Pop, Metal"'}
      </Typography>
      <Divisor />
      <Typography variant="subtitle1" fontWeight="bold">
        {currentSong.value.language === 'en' ? 'Ryhtms' : 'Ritmos'}
      </Typography>
      <Box display="flex" justifyContent="space-evenly" flexWrap="wrap">
        <CheckBoxChip
          label="Rock"
          checked={currentSong.value.rock}
          onClick={() => (currentSong.value.rock = !currentSong.value.rock)}
          disabled={currentSong.value.isLoading || system.value.isLoading}
        />
        <CheckBoxChip
          label="Pop"
          checked={currentSong.value.pop}
          onClick={() => (currentSong.value.pop = !currentSong.value.pop)}
          disabled={currentSong.value.isLoading || system.value.isLoading}
        />
        <CheckBoxChip
          label="Electronico"
          checked={currentSong.value.electronic}
          onClick={() =>
            (currentSong.value.electronic = !currentSong.value.electronic)
          }
          disabled={currentSong.value.isLoading || system.value.isLoading}
        />
        <CheckBoxChip
          label="Metal"
          checked={currentSong.value.metal}
          onClick={() => (currentSong.value.metal = !currentSong.value.metal)}
          disabled={currentSong.value.isLoading || system.value.isLoading}
        />
        <CheckBoxChip
          label="Country"
          checked={currentSong.value.country}
          onClick={() =>
            (currentSong.value.country = !currentSong.value.country)
          }
          disabled={currentSong.value.isLoading || system.value.isLoading}
        />
        <CheckBoxChip
          label="Mariachi"
          checked={currentSong.value.mariachi}
          onClick={() =>
            (currentSong.value.mariachi = !currentSong.value.mariachi)
          }
          disabled={currentSong.value.isLoading || system.value.isLoading}
        />
        <CheckBoxChip
          label="Balada"
          checked={currentSong.value.ballad}
          onClick={() => (currentSong.value.ballad = !currentSong.value.ballad)}
          disabled={currentSong.value.isLoading || system.value.isLoading}
        />
        <CheckBoxChip
          label="Jazz"
          checked={currentSong.value.jazz}
          onClick={() => (currentSong.value.jazz = !currentSong.value.jazz)}
          disabled={currentSong.value.isLoading || system.value.isLoading}
        />
        <CheckBoxChip
          label="Prehispanico"
          checked={currentSong.value.prehispanic}
          onClick={() =>
            (currentSong.value.prehispanic = !currentSong.value.prehispanic)
          }
          disabled={currentSong.value.isLoading || system.value.isLoading}
        />
        <CheckBoxChip
          label="Tropical"
          checked={currentSong.value.tropical}
          onClick={() =>
            (currentSong.value.tropical = !currentSong.value.tropical)
          }
          disabled={currentSong.value.isLoading || system.value.isLoading}
        />
        <CheckBoxChip
          label="Cumbia"
          checked={currentSong.value.cumbia}
          onClick={() => (currentSong.value.cumbia = !currentSong.value.cumbia)}
          disabled={currentSong.value.isLoading || system.value.isLoading}
        />
        <CheckBoxChip
          label="Salsa"
          checked={currentSong.value.salsa}
          onClick={() => (currentSong.value.salsa = !currentSong.value.salsa)}
          disabled={currentSong.value.isLoading || system.value.isLoading}
        />
        <CheckBoxChip
          label="Trio"
          checked={currentSong.value.trio}
          onClick={() => (currentSong.value.trio = !currentSong.value.trio)}
          disabled={currentSong.value.isLoading || system.value.isLoading}
        />
        <CheckBoxChip
          label="Trap"
          checked={currentSong.value.trap}
          onClick={() => (currentSong.value.trap = !currentSong.value.trap)}
          disabled={currentSong.value.isLoading || system.value.isLoading}
        />
        <CheckBoxChip
          label="Merengue"
          checked={currentSong.value.merengue}
          onClick={() =>
            (currentSong.value.merengue = !currentSong.value.merengue)
          }
          disabled={currentSong.value.isLoading || system.value.isLoading}
        />
        <CheckBoxChip
          label="Mambo"
          checked={currentSong.value.mambo}
          onClick={() => (currentSong.value.mambo = !currentSong.value.mambo)}
          disabled={currentSong.value.isLoading || system.value.isLoading}
        />
        <CheckBoxChip
          label="Ranchera"
          checked={currentSong.value.ranchera}
          onClick={() =>
            (currentSong.value.ranchera = !currentSong.value.ranchera)
          }
          disabled={currentSong.value.isLoading || system.value.isLoading}
        />
        <CheckBoxChip
          label="Regional Mexicano"
          checked={currentSong.value.mexican_regional}
          onClick={() =>
            (currentSong.value.mexican_regional =
              !currentSong.value.mexican_regional)
          }
          disabled={currentSong.value.isLoading || system.value.isLoading}
        />
        <CheckBoxChip
          label="Corrido"
          checked={currentSong.value.corrido}
          onClick={() =>
            (currentSong.value.corrido = !currentSong.value.corrido)
          }
          disabled={currentSong.value.isLoading || system.value.isLoading}
        />
        <CheckBoxChip
          label="Norteño"
          checked={currentSong.value.norteno}
          onClick={() =>
            (currentSong.value.norteno = !currentSong.value.norteno)
          }
          disabled={currentSong.value.isLoading || system.value.isLoading}
        />
        <CheckBoxChip
          label="Tribal"
          checked={currentSong.value.tribal}
          onClick={() => (currentSong.value.tribal = !currentSong.value.tribal)}
          disabled={currentSong.value.isLoading || system.value.isLoading}
        />
        <CheckBoxChip
          label="Banda Sinaloense"
          checked={currentSong.value.sinaloa_band}
          onClick={() =>
            (currentSong.value.sinaloa_band = !currentSong.value.sinaloa_band)
          }
          disabled={currentSong.value.isLoading || system.value.isLoading}
        />
        <CheckBoxChip
          label="Bachata"
          checked={currentSong.value.bachata}
          onClick={() =>
            (currentSong.value.bachata = !currentSong.value.bachata)
          }
          disabled={currentSong.value.isLoading || system.value.isLoading}
        />
        <CheckBoxChip
          label="Reggaeton"
          checked={currentSong.value.reggaeton}
          onClick={() =>
            (currentSong.value.reggaeton = !currentSong.value.reggaeton)
          }
          disabled={currentSong.value.isLoading || system.value.isLoading}
        />
        <CheckBoxChip
          label="Reggae"
          checked={currentSong.value.reggae}
          onClick={() => (currentSong.value.reggae = !currentSong.value.reggae)}
          disabled={currentSong.value.isLoading || system.value.isLoading}
        />
        <CheckBoxChip
          label="Urbano"
          checked={currentSong.value.urban}
          onClick={() => (currentSong.value.urban = !currentSong.value.urban)}
          disabled={currentSong.value.isLoading || system.value.isLoading}
        />
        <CheckBoxChip
          label="K-Pop"
          checked={currentSong.value.k_pop}
          onClick={() => (currentSong.value.k_pop = !currentSong.value.k_pop)}
          disabled={currentSong.value.isLoading || system.value.isLoading}
        />
        <CheckBoxChip
          label="Hip-Hop"
          checked={currentSong.value.hip_hop}
          onClick={() =>
            (currentSong.value.hip_hop = !currentSong.value.hip_hop)
          }
          disabled={currentSong.value.isLoading || system.value.isLoading}
        />
        <CheckBoxChip
          label="Rap"
          checked={currentSong.value.rap}
          onClick={() => (currentSong.value.rap = !currentSong.value.rap)}
          disabled={currentSong.value.isLoading || system.value.isLoading}
        />
        <CheckBoxChip
          label="Blues"
          checked={currentSong.value.blues}
          onClick={() => (currentSong.value.blues = !currentSong.value.blues)}
          disabled={currentSong.value.isLoading || system.value.isLoading}
        />
        <CheckBoxChip
          label="Ska"
          checked={currentSong.value.ska}
          onClick={() => (currentSong.value.ska = !currentSong.value.ska)}
          disabled={currentSong.value.isLoading || system.value.isLoading}
        />
        <CheckBoxChip
          label="Indie"
          checked={currentSong.value.indie}
          onClick={() => (currentSong.value.indie = !currentSong.value.indie)}
          disabled={currentSong.value.isLoading || system.value.isLoading}
        />
        <CheckBoxChip
          label="Acustico"
          checked={currentSong.value.acoustic}
          onClick={() =>
            (currentSong.value.acoustic = !currentSong.value.acoustic)
          }
          disabled={currentSong.value.isLoading || system.value.isLoading}
        />
        <CheckBoxChip
          label="R&B"
          checked={currentSong.value.rb}
          onClick={() => (currentSong.value.rb = !currentSong.value.rb)}
          disabled={currentSong.value.isLoading || system.value.isLoading}
        />
      </Box>
      <Divisor />
      <Typography variant="subtitle1" fontWeight="bold">
        {currentSong.value.language === 'en' ? 'Emotions' : 'Emociones'}
      </Typography>
      <Box display="flex" justifyContent="space-evenly" flexWrap="wrap">
        <CheckBoxChip
          label={
            currentSong.value.language === 'en' ? 'Happyness' : 'Felicidad'
          }
          checked={currentSong.value.happyness}
          onClick={() =>
            (currentSong.value.happyness = !currentSong.value.happyness)
          }
          disabled={currentSong.value.isLoading || system.value.isLoading}
        />
        <CheckBoxChip
          label={currentSong.value.language === 'en' ? 'Joy' : 'Alegria'}
          checked={currentSong.value.joy}
          onClick={() => (currentSong.value.joy = !currentSong.value.joy)}
          disabled={currentSong.value.isLoading || system.value.isLoading}
        />
        <CheckBoxChip
          label={currentSong.value.language === 'en' ? 'Love' : 'Amor'}
          checked={currentSong.value.love}
          onClick={() => (currentSong.value.love = !currentSong.value.love)}
          disabled={currentSong.value.isLoading || system.value.isLoading}
        />
        <CheckBoxChip
          label={currentSong.value.language === 'en' ? 'Sadness' : 'Tristeza'}
          checked={currentSong.value.sadness}
          onClick={() =>
            (currentSong.value.sadness = !currentSong.value.sadness)
          }
          disabled={currentSong.value.isLoading || system.value.isLoading}
        />
        <CheckBoxChip
          label={currentSong.value.language === 'en' ? 'Proud' : 'Orgullo'}
          checked={currentSong.value.proud}
          onClick={() => (currentSong.value.proud = !currentSong.value.proud)}
          disabled={currentSong.value.isLoading || system.value.isLoading}
        />
        <CheckBoxChip
          label={currentSong.value.language === 'en' ? 'Romantic' : 'Romantica'}
          checked={currentSong.value.romantic}
          onClick={() =>
            (currentSong.value.romantic = !currentSong.value.romantic)
          }
          disabled={currentSong.value.isLoading || system.value.isLoading}
        />
        <CheckBoxChip
          label={
            currentSong.value.language === 'en' ? 'Nostalgic' : 'Nostalgia'
          }
          checked={currentSong.value.nostalgic}
          onClick={() =>
            (currentSong.value.nostalgic = !currentSong.value.nostalgic)
          }
          disabled={currentSong.value.isLoading || system.value.isLoading}
        />
        <CheckBoxChip
          label={currentSong.value.language === 'en' ? 'Spite' : 'Despecho'}
          checked={currentSong.value.spite}
          onClick={() => (currentSong.value.spite = !currentSong.value.spite)}
          disabled={currentSong.value.isLoading || system.value.isLoading}
        />
        <CheckBoxChip
          label={currentSong.value.language === 'en' ? 'Angry' : 'Enojo'}
          checked={currentSong.value.angry}
          onClick={() => (currentSong.value.angry = !currentSong.value.angry)}
          disabled={currentSong.value.isLoading || system.value.isLoading}
        />
        <CheckBoxChip
          label={currentSong.value.language === 'en' ? 'Melodic' : 'Melodico'}
          checked={currentSong.value.melodic}
          onClick={() =>
            (currentSong.value.melodic = !currentSong.value.melodic)
          }
          disabled={currentSong.value.isLoading || system.value.isLoading}
        />
        <CheckBoxChip
          label={currentSong.value.language === 'en' ? 'Modern' : 'Moderno'}
          checked={currentSong.value.modern}
          onClick={() => (currentSong.value.modern = !currentSong.value.modern)}
          disabled={currentSong.value.isLoading || system.value.isLoading}
        />
        <CheckBoxChip
          label={
            currentSong.value.language === 'en' ? 'Emotional' : 'Emocional'
          }
          checked={currentSong.value.emotional}
          onClick={() =>
            (currentSong.value.emotional = !currentSong.value.emotional)
          }
          disabled={currentSong.value.isLoading || system.value.isLoading}
        />
        <CheckBoxChip
          label={
            currentSong.value.language === 'en'
              ? 'Clean rhythm'
              : 'Ritmo limpio'
          }
          checked={currentSong.value.clean_rhythm}
          onClick={() =>
            (currentSong.value.clean_rhythm = !currentSong.value.clean_rhythm)
          }
          disabled={currentSong.value.isLoading || system.value.isLoading}
        />
        <CheckBoxChip
          label={
            currentSong.value.language === 'en'
              ? 'Melodic chorus'
              : 'Coros melodicos'
          }
          checked={currentSong.value.melodic_chorus}
          onClick={() =>
            (currentSong.value.melodic_chorus =
              !currentSong.value.melodic_chorus)
          }
          disabled={currentSong.value.isLoading || system.value.isLoading}
        />
      </Box>
      <Divisor />
      <Typography variant="subtitle1" fontWeight="bold">
        {currentSong.value.language === 'en'
          ? 'Instruments'
          : 'Instrumentos musicales'}
      </Typography>

      <Box display="flex" justifyContent="space-evenly" flexWrap="wrap">
        <CheckBoxChip
          label="Piano"
          checked={currentSong.value.piano}
          onClick={() => (currentSong.value.piano = !currentSong.value.piano)}
          disabled={currentSong.value.isLoading || system.value.isLoading}
        />
        <CheckBoxChip
          label={currentSong.value.language === 'en' ? 'Guitars' : 'Guitarras'}
          checked={currentSong.value.guitar}
          onClick={() => (currentSong.value.guitar = !currentSong.value.guitar)}
          disabled={currentSong.value.isLoading || system.value.isLoading}
        />
        <CheckBoxChip
          label={
            currentSong.value.language === 'en'
              ? 'Electric guitar'
              : 'Guitarras electricas'
          }
          checked={currentSong.value.electric_guitar}
          onClick={() =>
            (currentSong.value.electric_guitar =
              !currentSong.value.electric_guitar)
          }
          disabled={currentSong.value.isLoading || system.value.isLoading}
        />
        <CheckBoxChip
          label={
            currentSong.value.language === 'en'
              ? 'Clean guitars'
              : 'Guitarras limpias'
          }
          checked={currentSong.value.clean_guitars}
          onClick={() =>
            (currentSong.value.clean_guitars = !currentSong.value.clean_guitars)
          }
          disabled={currentSong.value.isLoading || system.value.isLoading}
        />
        <CheckBoxChip
          label={
            currentSong.value.language === 'en'
              ? 'Requinto guitars'
              : 'Requinto'
          }
          checked={currentSong.value.requinto}
          onClick={() =>
            (currentSong.value.requinto = !currentSong.value.requinto)
          }
          disabled={currentSong.value.isLoading || system.value.isLoading}
        />
        <CheckBoxChip
          label={currentSong.value.language === 'en' ? 'Bass' : 'Bajo'}
          checked={currentSong.value.bass}
          onClick={() => (currentSong.value.bass = !currentSong.value.bass)}
          disabled={currentSong.value.isLoading || system.value.isLoading}
        />
        <CheckBoxChip
          label={currentSong.value.language === 'en' ? 'Trompets' : 'Trompetas'}
          checked={currentSong.value.trompets}
          onClick={() =>
            (currentSong.value.trompets = !currentSong.value.trompets)
          }
          disabled={currentSong.value.isLoading || system.value.isLoading}
        />
        <CheckBoxChip
          label={currentSong.value.language === 'en' ? 'Violin' : 'Violines'}
          checked={currentSong.value.violin}
          onClick={() => (currentSong.value.violin = !currentSong.value.violin)}
          disabled={currentSong.value.isLoading || system.value.isLoading}
        />
        <CheckBoxChip
          label={currentSong.value.language === 'en' ? 'Accordion' : 'Acordeon'}
          checked={currentSong.value.accordion}
          onClick={() =>
            (currentSong.value.accordion = !currentSong.value.accordion)
          }
          disabled={currentSong.value.isLoading || system.value.isLoading}
        />
        <CheckBoxChip
          label={currentSong.value.language === 'en' ? 'Saxophone' : 'Saxofon'}
          checked={currentSong.value.saxophone}
          onClick={() =>
            (currentSong.value.saxophone = !currentSong.value.saxophone)
          }
          disabled={currentSong.value.isLoading || system.value.isLoading}
        />
        <CheckBoxChip
          label={
            currentSong.value.language === 'en' ? 'Synthesizer' : 'Sintetizador'
          }
          checked={currentSong.value.synthesizer}
          onClick={() =>
            (currentSong.value.synthesizer = !currentSong.value.synthesizer)
          }
          disabled={currentSong.value.isLoading || system.value.isLoading}
        />
        <CheckBoxChip
          label={currentSong.value.language === 'en' ? 'Drums' : 'Bateria'}
          checked={currentSong.value.drums}
          onClick={() => (currentSong.value.drums = !currentSong.value.drums)}
          disabled={currentSong.value.isLoading || system.value.isLoading}
        />
        <CheckBoxChip
          label={
            currentSong.value.language === 'en'
              ? 'Hard Drums'
              : 'Bateria potente'
          }
          checked={currentSong.value.hardDrums}
          onClick={() =>
            (currentSong.value.hardDrums = !currentSong.value.hardDrums)
          }
          disabled={currentSong.value.isLoading || system.value.isLoading}
        />
      </Box>
      <Divisor />
      <Typography variant="subtitle1" fontWeight="bold">
        {currentSong.value.language === 'en' ? 'Voices' : 'Voces'}
      </Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="subtitle1">
            {currentSong.value.language === 'en' ? 'Type' : 'Tipo'}
          </Typography>
          <FormControl>
            <RadioGroup
              row
              value={currentSong.value.voice_type}
              onChange={(_e, value) => (currentSong.value.voice_type = value)}
            >
              <FormControlLabel
                value="Female"
                label={currentSong.value.language === 'en' ? 'Female' : 'Mujer'}
                control={<Radio />}
                disabled={currentSong.value.isLoading || system.value.isLoading}
              />
              <FormControlLabel
                value="Male"
                label={currentSong.value.language === 'en' ? 'Male' : 'Hombre'}
                control={<Radio />}
                disabled={currentSong.value.isLoading || system.value.isLoading}
              />
              <FormControlLabel
                value="Girl"
                label={currentSong.value.language === 'en' ? 'Girl' : 'Niña'}
                control={<Radio />}
                disabled={currentSong.value.isLoading || system.value.isLoading}
              />
              <FormControlLabel
                value="Boy"
                label={currentSong.value.language === 'en' ? 'Boy' : 'Niño'}
                control={<Radio />}
                disabled={currentSong.value.isLoading || system.value.isLoading}
              />
            </RadioGroup>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="subtitle1">
            {currentSong.value.language === 'en' ? 'Style' : 'Estilo'}
          </Typography>
          <FormControl>
            <RadioGroup
              row
              value={currentSong.value.voice_style}
              onChange={(_e, value) => (currentSong.value.voice_style = value)}
            >
              <FormControlLabel
                value="Young"
                label={currentSong.value.language === 'en' ? 'Young' : 'Joven'}
                control={<Radio />}
                disabled={currentSong.value.isLoading || system.value.isLoading}
              />
              <FormControlLabel
                value="Deep"
                label={currentSong.value.language === 'en' ? 'Deep' : 'Grave'}
                control={<Radio />}
                disabled={currentSong.value.isLoading || system.value.isLoading}
              />
              <FormControlLabel
                value="Soft"
                label={currentSong.value.language === 'en' ? 'Soft' : 'Suave'}
                control={<Radio />}
                disabled={currentSong.value.isLoading || system.value.isLoading}
              />
              <FormControlLabel
                value="Tenor"
                label="Tenor"
                control={<Radio />}
                disabled={currentSong.value.isLoading || system.value.isLoading}
              />
              <FormControlLabel
                value="Mature"
                label={
                  currentSong.value.language === 'en' ? 'Mature' : 'Madura'
                }
                control={<Radio />}
                disabled={currentSong.value.isLoading || system.value.isLoading}
              />
              <FormControlLabel
                value="Old"
                label={currentSong.value.language === 'en' ? 'Old' : 'Mayor'}
                control={<Radio />}
                disabled={currentSong.value.isLoading || system.value.isLoading}
              />
            </RadioGroup>
          </FormControl>
        </Grid>
      </Grid>
      <Divisor />
      <Box display="flex" flexWrap="wrap" justifyContent="space-evenly">
        {currentSong.value.voices.map((i: string, index: number) => {
          const [typeAndStyle, VocalStyle] = i.split('/');
          const [type, style] = typeAndStyle.split('-');
          let name = `${style ? `${style} ` : ''}${type} ${
            VocalStyle ? `${VocalStyle} ` : ''
          }Vocals`;

          if (currentSong.value.language === 'es') {
            const esStyle =
              style === 'Young'
                ? 'Joven'
                : style === 'Deep'
                  ? 'Grave'
                  : style === 'Soft'
                    ? 'Suave'
                    : style === 'Mature'
                      ? 'Madura'
                      : style === 'Old'
                        ? 'Mayor'
                        : style === 'Tenor'
                          ? 'Tenor'
                          : null;
            const esType =
              type === 'Female'
                ? 'Mujer'
                : type === 'Male'
                  ? 'Hombre'
                  : type === 'Girl'
                    ? 'Niña'
                    : 'Niño';
            if (esType && esStyle) {
              name = `Voz ${esStyle} de ${esType}${
                VocalStyle ? ` ${VocalStyle}` : ''
              }`;
            } else if (esType) {
              name = `Voz de ${esType}${VocalStyle ? ` ${VocalStyle}` : ''}`;
            }
          }

          return (
            <Paper elevation={2} key={index} style={{ marginBottom: 15 }}>
              <Box padding={2} display="flex" alignItems="center">
                {name}
                <Box width={10}></Box>
                <IconButton
                  aria-label="delete"
                  size="medium"
                  onClick={() => currentSong.value.deleteVoice(index)}
                  color="error"
                  disabled={
                    currentSong.value.isLoading || system.value.isLoading
                  }
                >
                  <DeleteIcon fontSize="medium" />
                </IconButton>
              </Box>
            </Paper>
          );
        })}
      </Box>
      <TextField
        label={
          currentSong.value.language === 'en'
            ? 'Voice style (optional)'
            : 'Estilo de voz (opcional)'
        }
        variant="outlined"
        size="small"
        type="text"
        name="vocalStyle"
        value={currentSong.value.vocalStyle}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          (currentSong.value.vocalStyle = e.target.value)
        }
        autoComplete="none"
        autoSave="none"
        disabled={currentSong.value.isLoading || system.value.isLoading}
        sx={{
          flexGrow: 1,
        }}
      />
      {currentSong.value.voices.length === 2 ? (
        <>
          <Divisor />
          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  value={currentSong.value.duo}
                  checked={currentSong.value.duo}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    (currentSong.value.duo = event.target.checked)
                  }
                />
              }
              label="Duo"
              disabled={currentSong.value.isLoading || system.value.isLoading}
            />
          </FormGroup>
        </>
      ) : null}
      <Divisor />
      <Box display="flex" justifyContent="end">
        <Button
          variant="contained"
          sx={{ textTransform: 'initial' }}
          onClick={() => {
            const tmp = [...currentSong.value.voices];
            let voice = currentSong.value.voice_type;
            if (currentSong.value.voice_style) {
              voice += `-${currentSong.value.voice_style}`;
            }
            if (currentSong.value.vocalStyle) {
              voice += `/${currentSong.value.vocalStyle}`;
            }
            tmp.push(voice);
            currentSong.value.voices = tmp;
            currentSong.value.voice_type = '';
            currentSong.value.voice_style = '';
            currentSong.value.vocalStyle = '';
          }}
          disabled={
            currentSong.value.isLoading ||
            system.value.isLoading ||
            !currentSong.value.voice_type
            // !currentSong.value.voice_style
          }
        >
          {currentSong.value.language === 'en' ? 'Add voice' : 'Agregar voz'}
        </Button>
      </Box>
      {/* Compiled: {currentSong.value.compiled_style} */}
      <Divisor />
      <Box display="flex">
        <TextField
          label={
            currentSong.value.language === 'en'
              ? 'Song style'
              : 'Estilo para la cancion'
          }
          variant="outlined"
          size="small"
          type="text"
          name="songStyle"
          value={currentSong.value.songStyle}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            (currentSong.value.songStyle = e.target.value)
          }
          autoComplete="none"
          autoSave="none"
          disabled={currentSong.value.isLoading || system.value.isLoading}
          sx={{
            flexGrow: 1,
          }}
        />
        {currentSong.value.songStyle ? (
          <Box marginLeft={2} display="flex">
            <IconButton
              aria-label="clean"
              size="medium"
              color="default"
              onClick={() => (currentSong.value.songStyle = '')}
            >
              <CleaningServicesIcon fontSize="medium" />
            </IconButton>
          </Box>
        ) : null}
      </Box>
      {currentSong.value.songStyle.length > 299 ? (
        <>
          <Divisor />
          <Typography variant="body1" color="error" fontWeight="bold">
            {currentSong.value.language === 'en'
              ? 'Error: Song style cannot exceed 300 characters'
              : 'Error: El estilo de la cancion no puede exceder 300 caracteres.'}
          </Typography>
        </>
      ) : null}
      <Divisor />
      <FormGroup>
        <FormControlLabel
          control={
            <Switch
              value={currentSong.value.songStyleBoost}
              checked={currentSong.value.songStyleBoost}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                (currentSong.value.songStyleBoost = event.target.checked)
              }
            />
          }
          label={
            currentSong.value.language === 'en'
              ? 'Boost style with AI'
              : 'Mejorar estilo con AI'
          }
          disabled={
            currentSong.value.isLoading ||
            system.value.isLoading ||
            (!currentSong.value.songStyle.length &&
              !currentSong.value.compiled_style.length)
          }
        />
      </FormGroup>
      <Typography variant="body1">
        <b>
          {currentSong.value.language === 'en'
            ? 'Recomended: '
            : 'Recomendado: '}
        </b>
        {currentSong.value.language === 'en'
          ? 'Improves the syle of the song based on selected style parameters, making the style rich and more natural results.'
          : 'Mejora el estilo de la cancion basado en los parametros de estilo selccionados, haciendo el estilo mas rico y natural.'}
      </Typography>
      {currentSong.value.llmSongStyle ? (
        <>
          <Divisor />
          <Box display="flex">
            <TextField
              label={
                currentSong.value.language === 'en'
                  ? 'Boosted song style'
                  : 'Estilo mejorado de cancion'
              }
              variant="outlined"
              size="small"
              type="text"
              name="llmSongStyle"
              multiline={true}
              rows={4}
              value={currentSong.value.llmSongStyle}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                (currentSong.value.llmSongStyle = e.target.value)
              }
              autoComplete="none"
              autoSave="none"
              disabled={currentSong.value.isLoading || system.value.isLoading}
              sx={{
                flexGrow: 1,
              }}
            />
            {currentSong.value.llmSongStyle ? (
              <Box marginLeft={2} display="flex">
                <IconButton
                  aria-label="clean"
                  size="medium"
                  color="default"
                  onClick={() => (currentSong.value.llmSongStyle = '')}
                >
                  <CleaningServicesIcon fontSize="medium" />
                </IconButton>
              </Box>
            ) : null}
          </Box>
        </>
      ) : null}
      <Divisor />
      <Box display="flex" justifyContent="space-between">
        <Button
          variant="contained"
          color="inherit"
          sx={{ textTransform: 'initial' }}
          onClick={() => (currentSong.value = new Song())}
          disabled={currentSong.value.isLoading || system.value.isLoading}
        >
          {currentSong.value.language === 'en' ? 'Clear' : 'Limpiar'}
        </Button>
        <Button
          variant="contained"
          color="success"
          sx={{
            textTransform: 'initial',
          }}
          type="submit"
          disabled={
            currentSong.value.isLoading ||
            system.value.isLoading ||
            !currentSong.value.llmLyrics ||
            !currentSong.value.name
          }
          loading={
            currentSong.value.isLoading ||
            system.value.isLoading ||
            currentSong.value.llmLyrics.length > 4999 ||
            currentSong.value.songStyle.length > 299
          }
          loadingPosition="end"
        >
          {currentSong.value.language === 'en'
            ? 'Generate song!'
            : 'Generar cancion!'}
        </Button>
      </Box>
      {currentSong.value.isLoading || system.value.isLoading ? (
        <Box
          width="100%"
          marginTop={2}
          display={{
            xs: 'block',
            md: 'none',
          }}
        >
          <LinearProgress />
        </Box>
      ) : null}
    </Box>
  );

  return (
    <>
      <Box onClick={() => system.value.getOnlineSongs()} ref={topRef}>
        <Typography
          variant="h6"
          fontWeight="bold"
          marginTop={3}
          marginBottom={1}
        >
          {currentSong.value.language === 'en'
            ? 'Create your own song!'
            : 'Crea tu propia cancion!'}{' '}
          🎵🎸🎺🥁
        </Typography>
      </Box>
      <Box display="flex" justifyContent="center">
        <Grid
          container
          spacing={2}
          marginBottom={3}
          maxWidth={!useAIForLyrics ? 600 : '100%'}
        >
          <Grid size={{ xs: 12, md: useAIForLyrics ? 4 : 12 }}>
            <Paper elevation={2}>{LLMLyricsForm}</Paper>
          </Grid>
          <Grid size={{ xs: 12, md: useAIForLyrics ? 8 : 12 }}>
            <Paper elevation={2}>{SongForm}</Paper>
          </Grid>

          {currentSong.value.isLoading || system.value.isLoading ? (
            <Grid size={12}>
              <Box
                width="100%"
                marginTop={1}
                display={{
                  xs: 'none',
                  md: 'block',
                }}
              >
                <LinearProgress />
              </Box>
            </Grid>
          ) : null}
        </Grid>

        <Dialog
          language={currentSong.value.language}
          onAgreed={() => (dialogOpen.value = false)}
          cancelEnabled={false}
          open={dialogOpen.value}
          title="Cancion siendo generada"
        >
          Tu cancion se esta creando en este momento!
          <br />
          <br />
          Por favor se paciente, la cancion puede tardar hasta 5 min en
          completarse.
          <br />
          <br />
          Una vez completa veras 2 muestras de tu cancion listas para descargar!
        </Dialog>
      </Box>

      {system.value.onlineSongs.length || system.value.songs.length ? (
        <Box marginBottom={15}>
          <Box display="flex" justifyContent="space-between" marginBottom={2}>
            <Typography variant="h6" fontWeight="bold" marginBottom={1}>
              {currentSong.value.language === 'en'
                ? 'Your songs'
                : 'Tus canciones'}{' '}
              📋🎵
            </Typography>
            <Box display="flex">
              {system.value.onlineSongs.length ? (
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        value={onlineSongs}
                        onChange={(
                          event: React.ChangeEvent<HTMLInputElement>
                        ) => setOnlineSongs(event.target.checked)}
                      />
                    }
                    label="Online"
                    disabled={
                      currentSong.value.isLoading || system.value.isLoading
                    }
                  />
                </FormGroup>
              ) : null}
              <Box marginRight={1}>
                <FormControl fullWidth sx={{ width: 70 }}>
                  <InputLabel id="number-of-songs">Songs</InputLabel>
                  <Select
                    labelId="number-of-songs"
                    id="song-num-select"
                    size="small"
                    value={String(itemsToDisplay)}
                    label="Items"
                    onChange={(e: SelectChangeEvent) => {
                      setItemsToDisplay(Number(e.target.value));
                      setPage(1);
                    }}
                  >
                    <MenuItem value={1}>1</MenuItem>
                    <MenuItem value={5}>5</MenuItem>
                    <MenuItem value={10}>10</MenuItem>
                    <MenuItem value={20}>20</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>
          </Box>
          <GridOfSongs
            items={songsToRender}
            editItem={(song: Song) => {
              if (topRef && topRef.current) {
                topRef.current.scrollIntoView();
              }
              resetForms();
              currentSong.value = new Song();
              currentSong.value.name = song.name;
              if (song.prompt) {
                currentSong.value.prompt = song.prompt;
              }
              if (song.negativePrompt) {
                currentSong.value.negativePrompt = song.negativePrompt;
              }
              if (song.lyricsStyle) {
                currentSong.value.lyricsStyle = song.lyricsStyle;
              }
              // if (song.llmSongStyle) {
              //   currentSong.value.llmSongStyle = song.llmSongStyle;
              // }
              currentSong.value.rock = song.rock ?? false;
              currentSong.value.pop = song.pop ?? false;
              currentSong.value.electronic = song.electronic ?? false;
              currentSong.value.metal = song.metal ?? false;
              currentSong.value.country = song.country ?? false;
              currentSong.value.mariachi = song.mariachi ?? false;
              currentSong.value.ballad = song.ballad ?? false;
              currentSong.value.jazz = song.jazz ?? false;
              currentSong.value.prehispanic = song.prehispanic ?? false;
              currentSong.value.tropical = song.tropical ?? false;
              currentSong.value.cumbia = song.cumbia ?? false;
              currentSong.value.salsa = song.salsa ?? false;
              currentSong.value.trio = song.trio ?? false;
              currentSong.value.trap = song.trap ?? false;
              currentSong.value.merengue = song.merengue ?? false;
              currentSong.value.mambo = song.mambo ?? false;
              currentSong.value.ranchera = song.ranchera ?? false;
              currentSong.value.mexican_regional =
                song.mexican_regional ?? false;
              currentSong.value.corrido = song.corrido ?? false;
              currentSong.value.norteno = song.norteno ?? false;
              currentSong.value.tribal = song.tribal ?? false;
              currentSong.value.sinaloa_band = song.sinaloa_band ?? false;
              currentSong.value.bachata = song.bachata ?? false;
              currentSong.value.reggaeton = song.reggaeton ?? false;
              currentSong.value.reggae = song.reggae ?? false;
              currentSong.value.urban = song.urban ?? false;
              currentSong.value.k_pop = song.k_pop ?? false;
              currentSong.value.hip_hop = song.hip_hop ?? false;
              currentSong.value.rap = song.rap ?? false;
              currentSong.value.blues = song.blues ?? false;
              currentSong.value.ska = song.ska ?? false;
              currentSong.value.indie = song.indie ?? false;
              currentSong.value.acoustic = song.acoustic ?? false;
              currentSong.value.rb = song.rb ?? false;

              currentSong.value.happyness = song.happyness ?? false;
              currentSong.value.joy = song.joy ?? false;
              currentSong.value.love = song.love ?? false;
              currentSong.value.sadness = song.sadness ?? false;
              currentSong.value.proud = song.proud ?? false;
              currentSong.value.romantic = song.romantic ?? false;
              currentSong.value.nostalgic = song.nostalgic ?? false;
              currentSong.value.spite = song.spite ?? false;
              currentSong.value.angry = song.angry ?? false;
              currentSong.value.melodic = song.melodic ?? false;
              currentSong.value.modern = song.modern ?? false;
              currentSong.value.emotional = song.emotional ?? false;
              currentSong.value.clean_rhythm = song.clean_rhythm ?? false;
              currentSong.value.melodic_chorus = song.melodic_chorus ?? false;

              currentSong.value.piano = song.piano ?? false;
              currentSong.value.guitar = song.guitar ?? false;
              currentSong.value.electric_guitar = song.electric_guitar ?? false;
              currentSong.value.requinto = song.requinto ?? false;
              currentSong.value.bass = song.bass ?? false;
              currentSong.value.trompets = song.trompets ?? false;
              currentSong.value.violin = song.violin ?? false;
              currentSong.value.accordion = song.accordion ?? false;
              currentSong.value.saxophone = song.saxophone ?? false;
              currentSong.value.synthesizer = song.synthesizer ?? false;
              currentSong.value.drums = song.drums ?? false;
              currentSong.value.hardDrums = song.hardDrums ?? false;

              if (song.songStyle) {
                currentSong.value.songStyle = song.songStyle;
              }
              if (song.llmLyrics) {
                currentSong.value.llmLyrics = song.llmLyrics;
              }
              if (song.voices) {
                currentSong.value.voices = song.voices
                  .map((value: string) => {
                    const values = value.split(' ');
                    let voice_style = '';
                    let voice_type = '';
                    let vocalStyle = '';
                    if (values.length === 4) {
                      voice_style = values[0];
                      voice_type = values[1];
                      vocalStyle = values[2];
                    } else if (values.length === 3) {
                      voice_style = values[0];
                      voice_type = values[1];
                    } else if (values.length === 2) {
                      voice_type = values[0];
                    }
                    let voice = voice_type;
                    if (voice_style) {
                      voice += `-${voice_style}`;
                    }
                    if (vocalStyle) {
                      voice += `/${vocalStyle}`;
                    }
                    return voice;
                  })
                  .filter((i) => i !== '');
              }
            }}
            retryItem={(song: Song) => RetrySong(song)}
            deleteItem={(id) => system.value.deleteSong(id)}
          />
          <Divisor />
          <Box display="flex" justifyContent="center">
            <Pagination
              count={Math.round(songs.length / itemsToDisplay)}
              color="primary"
              page={page}
              onChange={(_e: React.ChangeEvent<unknown>, value: number) =>
                setPage(value)
              }
            />
          </Box>
        </Box>
      ) : null}
    </>
  );
};

export default EditorForm;
