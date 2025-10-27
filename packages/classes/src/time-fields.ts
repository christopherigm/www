import { Signal, signal } from '@preact-signals/safe-react';
import { SubstractDates } from '@repo/helpers/date-parser';

type DateEnum = 'created' | 'modified';
const months = [
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

export default class TimeFields {
  private _created: Signal<Date | null> = signal(null);
  private _modified: Signal<Date | null> = signal(null);

  public setAttributesFromPlainObject(object: any) {
    if (object.attributes) {
      this.created = object.attributes.created ?? this.created;
      this.modified = object.attributes.modified ?? this.modified;
    }
  }

  public getPlainAttributes(): any {
    return {
      ...(this.created && {
        created: this.created.toString(),
      }),
      ...(this.modified && {
        modified: this.modified.toString(),
      }),
    };
  }

  public time12HoursFormat(type: DateEnum): string {
    const date: Date = new Date(this[type] ?? new Date());
    let h = date.getHours();
    const m = date.getMinutes();
    let pmam = 'am';
    if (h === 12) {
      pmam = 'pm';
    } else if (h > 12) {
      h = h - 12;
      pmam = 'pm';
    }
    return `${h > 9 ? h : `0${h}`}:${m > 9 ? m : `0${m}`}${pmam}`;
  }

  public humanReadableDate(
    type: DateEnum,
    shortFormat: boolean = false,
    includeTime: boolean = true,
    showYear: boolean = true
  ): string {
    const date: Date = new Date(this[type] ?? new Date());
    const month = shortFormat ? date.getMonth() + 1 : months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    const h = date.getHours();
    const m = date.getMinutes();
    const time = ` - ${h > 9 ? h : `0${h}`}:${m > 9 ? m : `0${m}`}hrs`;
    return shortFormat
      ? `${month}/${day}${showYear ? `/${year}` : ''}${includeTime ? time : ''}`
      : `${month} ${day}, ${year}${includeTime ? time : ''}`;
  }

  public getDaysFromDate(type: DateEnum): number {
    const date: Date = new Date(this[type] ?? new Date());
    const today = new Date();
    const diff = SubstractDates(today, date);
    const years = Number(diff.getFullYear()) * 365;
    const months = Number(diff.getMonth()) * 30;
    const days = diff.getUTCDate();
    const total = years + months + days;
    return total;
  }

  public get created() {
    return this._created.value;
  }
  public set created(value) {
    this._created.value = value;
  }

  public get modified() {
    return this._modified.value;
  }
  public set modified(value) {
    this._modified.value = value;
  }
}
