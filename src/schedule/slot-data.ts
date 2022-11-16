import { DAYOFF1_PREFIX, DAYOFF2_PREFIX, WORKDAY_PREFIX } from './const';

export type DayPrefix =
  | typeof WORKDAY_PREFIX
  | typeof DAYOFF1_PREFIX
  | typeof DAYOFF2_PREFIX;
export type SlotIdx = '1' | '2' | '3' | '4' | '5' | '6';

export interface SlotData {
  namePrefix: string;
  time?: string;
  temp?: string;
}

export type DaySlots = { [key in SlotIdx]: SlotData };
export type SlotsMap = { [key in DayPrefix]: DaySlots };
