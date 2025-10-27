'use client';

import Clock from '@/components/clock';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { useEffect, useState, useRef } from 'react';
import type { FormEvent } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';

import getRandomNumber from '@repo/helpers/random-number';

import SucessAlert from '@/components/success-alert';
import useFormHeader from '@/components/form-header';
import useLLMHelp from '@/components/llm-help';

const ClockLayout = () => {
  const [answerHours, setAnswerHours] = useState<string>('');
  const [answerMinutes, setAnswerMinutes] = useState<string>('');
  const [hour, setHour] = useState<number>(0);
  const [minute, setMinute] = useState<number>(0);
  const hourRef = useRef<HTMLInputElement>(null);
  const minuteRef = useRef<HTMLInputElement>(null);
  const [success, setSuccess] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const resetFrom = () => {
    setHour(getRandomNumber(1, 12));
    setMinute(getRandomNumber(5, 11) * 5);
    setAnswerHours('');
    setAnswerMinutes('');
    setSuccess(null);
    clearHelp();
  };
  const { language, header } = useFormHeader({
    isLoading,
    callback: resetFrom,
  });

  const getPrompt = (): string => {
    const clockHour = Number(hour);
    const clockMinute = Number(minute) / 5;

    const enPrompt = !clockMinute
      ? `Given the following statement: "There is a round analog clock in the screen. The hour hand (small) on the clock is pointing exactly to the number ${clockHour} which means the hour is ${clockHour} o'clock. The minute hand (big) on the clock is pointing to the number 12 which means the minutes are ${minute}. The time on the clock is ${clockHour}:00 o'clock." Explain it to a 7 years old kid in less than 100 words.`
      : `Given the following statement: "There is a round analog clock in the screen. The hour hand (small) on the clock is pointing slightly ahead of number ${clockHour} which means the hour is still ${clockHour}. The minute hand (big) on the clock is pointing to the number ${clockMinute} which means the minutes are ${minute}, since we need to multiply the number ${clockMinute} on the clock by 5 to get ${minute} minutes of the time. The time on the clock is ${clockHour}:${minute}." Explain it to a 7 years old kid in less than 100 words.`;

    const esPrompt = !clockMinute
      ? `Dada la siguiente afirmacion: "Hay un reloj analogo en la patalla. La manecilla de las horas (pequeña) esta apuntando exactamente al numero ${clockHour} lo que significa que la hora exacta es ${clockHour} en punto. La manecilla de los minutos (grande) esta apuntando al numero 12 lo que significa que los minutos son ${minute}. El tiempo en el reloj es ${clockHour}:00 en punto." Explica esto a un niño de 7 años en menos de 100 palabras.`
      : `Dada la siguiente afirmacion: "Hay un reloj analogo en la patalla. La manecilla de las horas (pequeña) esta apuntando ligeramente adelante del numero ${clockHour} lo que significa que la hora son aun las ${clockHour}. La manecilla de los minutos (grande) esta apuntando al numero ${clockMinute} lo que significa que los minutos son ${minute}, ya que debemos de multiplicar el numero ${clockMinute} que esta en el reloj por 5 para obtener los ${minute} minutos del tiempo. El tiempo en el reloj es ${clockHour}:00 en punto." Explica esto a un niño de 7 años en menos de 100 palabras.`;
    const prompt = language === 'en' ? enPrompt : esPrompt;
    return prompt;
  };

  const { LLMHelp, HelpButton, clearHelp } = useLLMHelp({
    prompt: getPrompt(),
    isLoading,
    onLoading: (value) => setIsLoading(value),
    language: language,
  });

  useEffect(() => {
    if (!hour) {
      setHour(getRandomNumber(1, 12));
      setMinute(getRandomNumber(0, 11) * 5);
    }
  }, [hour]);

  const checkInputValues = () =>
    setSuccess(
      Number(answerHours) === hour && Number(answerMinutes) === minute
    );

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    checkInputValues();
    if (hourRef && hourRef.current) {
      hourRef.current.getElementsByTagName('input')[0]?.blur();
    }
    if (minuteRef && minuteRef.current) {
      minuteRef.current.getElementsByTagName('input')[0]?.blur();
    }
  };

  const canSubmit = (): boolean => {
    return answerHours !== '' && answerMinutes !== '';
  };

  return (
    <Box
      component="form"
      noValidate={false}
      autoComplete="on"
      onSubmit={handleSubmit}
      marginTop={3}
      marginBottom={3}
    >
      <Grid container rowSpacing={2}>
        {header}
        <Grid size={{ xs: 12 }}>
          <Clock
            fixedTime={new Date(`01/01/2024 ${hour}:${minute}`)}
            size={250}
          />
        </Grid>
        {success === null || !success ? (
          <Grid size={{ xs: 12 }} marginTop={2}>
            <Grid container columnSpacing={3}>
              <Grid size={{ xs: 6 }}>
                <TextField
                  ref={hourRef}
                  label={language === 'en' ? 'Hours' : 'Horas'}
                  variant="outlined"
                  size="small"
                  type="number"
                  autoComplete="none"
                  autoSave="none"
                  value={answerHours}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setSuccess(null);
                    const value = Math.floor(Number(e.target.value));
                    if (value >= 0 && value <= 12) {
                      setAnswerHours(value.toString());
                    }
                  }}
                  onSubmit={() => checkInputValues()}
                  style={{ width: '100%' }}
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  ref={minuteRef}
                  label={language === 'en' ? 'Minutes' : 'Minutos'}
                  variant="outlined"
                  size="small"
                  type="number"
                  autoComplete="none"
                  autoSave="none"
                  value={answerMinutes}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setSuccess(null);
                    const value = Math.floor(Number(e.target.value));
                    if (value >= 0 && value <= 60) {
                      setAnswerMinutes(value.toString());
                    }
                  }}
                  onSubmit={() => checkInputValues()}
                  style={{ width: '100%' }}
                />
              </Grid>
            </Grid>
          </Grid>
        ) : (
          <Grid size={{ xs: 12 }}>
            <Typography variant="h2" align="right">
              {`${answerHours}:${
                Number(answerMinutes) < 10 ? '0' : ''
              }${answerMinutes}`}
            </Typography>
          </Grid>
        )}
        <SucessAlert success={success} language={language} />
        {isLoading ? (
          <Box sx={{ width: '100%' }}>
            <LinearProgress />
          </Box>
        ) : null}
        {!success ? (
          <Grid size={{ xs: 12 }} display="flex" justifyContent="end">
            {hour ? HelpButton : null}
            <Button
              type="submit"
              variant="contained"
              disabled={!canSubmit()}
              onSubmit={handleSubmit}
              onClick={() => checkInputValues()}
              size="small"
              sx={{ textTransform: 'inherit' }}
            >
              {language === 'en' ? 'Check' : 'Verificar'}
            </Button>
          </Grid>
        ) : (
          <Grid size={{ xs: 12 }} display="flex" justifyContent="end">
            <Button
              variant="contained"
              onClick={() => resetFrom()}
              size="small"
              sx={{ textTransform: 'inherit' }}
            >
              {language === 'en' ? 'New One!' : 'Nuevo reloj!'}
            </Button>
          </Grid>
        )}
        {LLMHelp}
      </Grid>
    </Box>
  );
};

export default ClockLayout;
