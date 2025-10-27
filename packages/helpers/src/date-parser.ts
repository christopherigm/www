export const monthsArray = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const spanishMonthsArray = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

export const shortMonthsArray = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export const spanishShortMonthsArray = [
  'Ene',
  'Feb',
  'Mar',
  'Abr',
  'May',
  'Jun',
  'Jul',
  'Ago',
  'Sep',
  'Oct',
  'Nov',
  'Dic',
];

export const DateParser = (
  date: string,
  shortMonths: boolean = false
): string => {
  const parsedDate = new Date(date);

  const month = shortMonths
    ? shortMonthsArray[parsedDate.getMonth()]
    : monthsArray[parsedDate.getMonth()];
  const day = parsedDate.getUTCDate();
  const year = parsedDate.getFullYear();

  return `${month} ${day}, ${year}`;
};

export const ShortDateParser = (
  date: string,
  year: boolean = false
): string => {
  const parsedDate = new Date(date);
  const month = parsedDate.getMonth() + 1;
  const day = parsedDate.getUTCDate();

  return `${month}/${day}${year ? `/${parsedDate.getFullYear()}` : ''}`;
};

export const DjangoDateTimeField = (date: string): string => {
  if (!date) {
    return '';
  }
  return `${DateFormatForInput(date)}T${HourParser(date)}`;
};

export const GetDifferenceInSeconds = (d1: Date, d2: Date): number | null => {
  if (!d1 || !d2) {
    return null;
  }
  const time = SubstractDates(new Date(d1), new Date(d2));
  const h = time.getHours();
  const m = time.getMinutes() * 60;
  const s = time.getSeconds();
  const total = s + m;
  return total;
};

export const DateFormatForInput = (date: string): string => {
  if (!date) {
    return '';
  }
  const parsedDate = new Date(date);
  const year = parsedDate.getFullYear();
  const month = parsedDate.getMonth() + 1;
  const day = parsedDate.getDate();
  const d = `${year}-${month < 10 ? `0${month}` : month}-${
    day < 10 ? `0${day}` : day
  }`;
  return d;
};

export const SubstractDates = (d1: Date, d2: Date): Date => {
  const diff = Math.abs(d2.getTime() - d1.getTime());
  const dateDiff = new Date();
  dateDiff.setTime(diff);
  dateDiff.setFullYear(dateDiff.getFullYear() - 1970);
  return dateDiff;
};

export const DateRangeComposer = (
  startDate: Date | null,
  endDate: Date | null,
  shortMonth: boolean = false
): string => {
  const startDateString = startDate
    ? DateParser(startDate.toString(), shortMonth)
    : '';
  const endDateString = endDate
    ? DateParser(endDate.toString(), shortMonth)
    : 'Present';
  const d1 = startDate ? new Date(startDate) : new Date();
  const d2 = endDate ? new Date(endDate) : new Date();
  const diff = SubstractDates(d2, d1);
  let years = diff.getFullYear();
  let months = diff.getMonth() / 12;
  const dates = `${startDateString} to ${endDateString} (${years}${
    months ? `.${months.toFixed(2).toString().split('.')[1]}` : ''
  } years)`;
  return dates;
};

export const HourParser = (date: string): string => {
  const parsedDate = new Date(date);
  const h = parsedDate.getHours();
  const m = parsedDate.getMinutes();
  const s = parsedDate.getSeconds();

  return `${h > 9 ? h : `0${h}`}:${m > 9 ? m : `0${m}`}:${s}`;
};

export const HourParser12Format = (date: string): string => {
  const parsedDate = new Date(date);
  let h = parsedDate.getHours();
  const m = parsedDate.getMinutes();
  let pmam = 'am';

  if (h === 12) {
    pmam = 'pm';
  } else if (h > 12) {
    h = h - 12;
    pmam = 'pm';
  }

  return `${h > 9 ? h : `0${h}`}:${m > 9 ? m : `0${m}`} ${pmam}`;
};

export const ArrayErrorsToHTMLList = (errors: Array<any>): string => {
  let errorMessages = '';
  errors.forEach((i: any) => {
    if (i.source) {
      let field = i.source.pointer.split('/');
      field = field[field.length - 1];
      const unique = i.code === 'unique' ? true : false;
      if (unique && field === 'email') {
        errorMessages +=
          '<li>Hay una cuenta registrada con este correo electronico.</li>';
      } else if (i.code !== 'blank') {
        errorMessages += `<li>${i.detail}: ${field}</li>`;
      }
    } else {
      if (i.detail === 'Wrong credentials') {
        errorMessages += `<li>El correo o la contrasena son incorrectos (${i.detail}).</li>`;
      } else {
        errorMessages += `<li>${i.detail}</li>`;
      }
    }
  });
  return errorMessages;
};
