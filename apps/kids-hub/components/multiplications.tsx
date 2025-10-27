'use client';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import SucessAlert from '@/components/success-alert';
import UseFormHeader from '@/components/form-header';
import useLLMHelp from '@/components/llm-help';
import LinearProgress from '@mui/material/LinearProgress';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Slider from '@mui/material/Slider';
import getRandomNumber from '@repo/helpers/random-number';
import NumberToInputArray from '@/components/number-to-input-array';

const Multiplications = () => {
  const difficultyNumbers = [1, 2, 3];
  const firstNumberRanges = [
    {
      min: 10,
      max: 99,
    },
    {
      min: 100,
      max: 999,
    },
    {
      min: 1000,
      max: 9999,
    },
  ];
  const secondNumberRanges = [
    {
      min: 1,
      max: 9,
    },
    {
      min: 10,
      max: 99,
    },
    {
      min: 100,
      max: 999,
    },
  ];
  const [difficulty, setDifficulty] = useState<number>(1);
  const [success, setSuccess] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [firstNumber, setFirstNumber] = useState<number>(0);
  const [secondNumber, setSecondNumber] = useState<number>(0);

  const [resultInputs, setResultInputs] = useState<Array<string>>([]);

  const [result, setResult] = useState<string>('');

  const resetFrom = (value?: number) => {
    setResult('');
    const selector = (value ?? difficulty) - 1;
    const firstNumber = getRandomNumber(
      firstNumberRanges[selector].min,
      firstNumberRanges[selector].max
    );
    const secondNumber = getRandomNumber(
      secondNumberRanges[selector].min,
      secondNumberRanges[selector].max
    );
    setFirstNumber(firstNumber);
    setSecondNumber(secondNumber);
    const stringResult: Array<string> = (firstNumber * secondNumber)
      .toString()
      .split('');
    setResultInputs(stringResult.map(() => ''));
    setSuccess(null);
    clearHelp();
  };
  const { language, header } = UseFormHeader({
    isLoading,
    callback: () => resetFrom(),
  });

  const getPrompt = (): string => {
    const enPrompt = `Given the following statement: "Multiply the one-digit number by each digit of the two-digit number, starting from the ones place. 'Step 1: ,multiply the ones digit' Multiply the one-digit number by the ones digit of the two-digit number. If the result is greater than \(9\), carry-over the tens digit to the tens place. Write down the ones digit of the result. 'Step 2 Multiply the tens digit' Multiply the one-digit number by the tens digit of the two-digit number.Add the carry-over (if any) from the previous step. Write down the result. 'Step 3 Combine the results' Combine the results from step \(1\) and step \(2\) to get the final product." Explain how to solve the following operation: "${firstNumber} X ${secondNumber}" to a 7 years old kid in less than 100 words.`;

    const esPrompt = `Dada la siguiente afirmacion: "Esta es una multiplicacion, el primer numero (el de arriba) es ${firstNumber} y el segundo numero (el de abajo) es ${secondNumber}, para resolver la multiplicacion, deberas multiplicar el numero de abajo por cada uno de los numeros individuales de arriba de derecha a izquierda. Si el resultado tiene mas de dos digitos deberas tomar el primer digito y sumarlo a la multiplicacion del numero de abajo con el otro digito del numero de arriba." Explica esto a un niño de 7 años en menos de 100 palabras.`;
    const prompt = language === 'en' ? enPrompt : esPrompt;
    return prompt;
  };

  const { LLMHelp, clearHelp } = useLLMHelp({
    prompt: getPrompt(),
    isLoading,
    onLoading: (value) => setIsLoading(value),
    language: language,
  });

  const canSubmit = (): boolean => {
    return Number(result) >= 0;
  };

  const checkInputValues = () =>
    setSuccess(Number(result) === firstNumber * secondNumber);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    checkInputValues();
  };

  useEffect(() => {
    const selector = difficulty - 1;
    const firstNumber = getRandomNumber(
      firstNumberRanges[selector].min,
      firstNumberRanges[selector].max
    );
    const secondNumber = getRandomNumber(
      secondNumberRanges[selector].min,
      secondNumberRanges[selector].max
    );
    setFirstNumber(firstNumber);
    setSecondNumber(secondNumber);
    setResult('');
    const stringResult: Array<string> = (firstNumber * secondNumber)
      .toString()
      .split('');
    setResultInputs(stringResult.map(() => ''));
  }, []);

  if (!firstNumber || !secondNumber) {
    return <></>;
  }

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

        <Grid
          size={{ xs: 12 }}
          marginTop={2}
          display="flex"
          flexDirection="column"
        >
          <Typography variant="subtitle1" align="center" fontWeight="bold">
            Difficulty
          </Typography>
          <Slider
            aria-label="Difficulty"
            defaultValue={1}
            valueLabelDisplay="auto"
            shiftStep={1}
            step={1}
            marks={difficultyNumbers.map((i) => {
              return {
                value: i,
                label: i.toString(),
              };
            })}
            onChange={(_e, value) => {
              const v = Number(value);
              setDifficulty(v);
              resetFrom(v);
            }}
            min={1}
            max={3}
            color={
              difficulty === 1 ? 'info' : difficulty === 2 ? 'warning' : 'error'
            }
          />
        </Grid>
        <Grid
          size={{ xs: 12 }}
          marginTop={2}
          display="flex"
          justifyContent="center"
        >
          <Box
            width={resultInputs.length * 40}
            display="flex"
            flexDirection="column"
          >
            <Typography variant="h2" align="right" letterSpacing={5}>
              {firstNumber}
            </Typography>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="h2" align="right">
                X
              </Typography>
              <Typography variant="h2" align="right" letterSpacing={5}>
                {secondNumber}
              </Typography>
            </Box>
            <Box borderBottom="1px solid black" marginBottom={1} />
            <Box display="flex" flexDirection="column" alignItems="end">
              {secondNumber.toString().split('').length > 1 ? (
                <>
                  {secondNumber
                    .toString()
                    .split('')
                    .reverse()
                    .map((i: string, index: number) => {
                      const num = Number(i);
                      return (
                        <NumberToInputArray
                          key={index}
                          value={num * firstNumber}
                          offset={index}
                          numberOfRef={firstNumber}
                        />
                      );
                    })}
                  <Box
                    borderBottom="1px solid black"
                    marginBottom={1}
                    width="100%"
                  />
                </>
              ) : null}
              <NumberToInputArray
                value={firstNumber * secondNumber}
                onChange={(value) => {
                  setSuccess(null);
                  setResult(value);
                }}
                onSubmit={() => checkInputValues()}
              />
            </Box>
          </Box>
        </Grid>

        <SucessAlert success={success} language={language} />
        {isLoading ? (
          <Box sx={{ width: '100%' }}>
            <LinearProgress />
          </Box>
        ) : null}
        {!success ? (
          <Grid size={{ xs: 12 }} display="flex" justifyContent="end">
            {/* {firstNumber ? HelpButton : null} */}
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
              {language === 'en' ? 'New One!' : 'Nueva multiplicacion!'}
            </Button>
          </Grid>
        )}
        {LLMHelp}
      </Grid>
    </Box>
  );
};

export default Multiplications;
