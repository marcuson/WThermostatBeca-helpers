import { Fragment } from '@violentmonkey/dom';
import styles from '../style.module.css';
import { toast } from '../toast/toast';
import { downloadObjectAsJson } from '../utils/download-utils';
import { askFileToRead } from '../utils/file-utils';
import { strReplaceAt } from '../utils/str-utils';
import {
  DAYOFF1_PREFIX,
  DAYOFF2_PREFIX,
  TEMP_SUFFIX,
  TIME_SUFFIX,
  WORKDAY_PREFIX,
} from './const';
import { DayPrefix, DaySlots, SlotsMap, SlotIdx } from './slot-data';

let copiedData: SlotsMap = undefined;

function createCopyBtn(fn: (e: Event) => unknown) {
  return createSmallBtn('Copy', true, fn);
}

function createPasteBtn(fn: (e: Event) => unknown) {
  return createSmallBtn('Paste', false, fn);
}

function createSmallBtn(
  text: string,
  withMarginRight: boolean,
  fn: (e: Event) => unknown
) {
  const classes = [styles.btn, styles.small];
  if (withMarginRight) {
    classes.push(styles.mr);
  }

  return VM.m(
    <button class={classes.join(' ')} onclick={fn}>
      {text}
    </button>
  ) as HTMLButtonElement;
}

function addBtnsTableHeaders(copyBtn: Node, pasteBtn: Node, elem: Element) {
  elem.textContent = elem.textContent + ' ';
  elem.appendChild(copyBtn);
  elem.appendChild(pasteBtn);
}

export function addButtons() {
  const saveAndRestoreDefaultsBtn = VM.m(
    <div class={styles.btnContainer}>
      <span class={styles.btnGrouper}>
        <button class={styles.btn} onclick={saveDefaults}>
          Save current as defaults
        </button>
        <button class={styles.btn} onclick={restoreDefaults}>
          Restore defaults
        </button>
      </span>
      <hr class={styles.btnSpacer}></hr>
      <span class={styles.btnGrouper}>
        <button class={styles.btn} onclick={exportData}>
          Export
        </button>
        <button class={styles.btn} onclick={importData}>
          Import
        </button>
      </span>
    </div>
  );
  document
    .querySelector('table.settingstable')
    .before(saveAndRestoreDefaultsBtn);

  const copyWorkDayBtn = createCopyBtn(copyDataFn(WORKDAY_PREFIX));
  const pasteWorkDayBtn = createPasteBtn(pasteDataFn(WORKDAY_PREFIX));
  addBtnsTableHeaders(
    copyWorkDayBtn,
    pasteWorkDayBtn,
    document.querySelector('table.settingstable thead th:nth-child(2)')
  );

  const copyDayOff1Btn = createCopyBtn(copyDataFn(DAYOFF1_PREFIX));
  const pasteDayOff1Btn = createPasteBtn(pasteDataFn(DAYOFF1_PREFIX));
  addBtnsTableHeaders(
    copyDayOff1Btn,
    pasteDayOff1Btn,
    document.querySelector('table.settingstable thead th:nth-child(3)')
  );

  const copyDayOff2Btn = createCopyBtn(copyDataFn(DAYOFF2_PREFIX));
  const pasteDayOff2Btn = createPasteBtn(pasteDataFn(DAYOFF2_PREFIX));
  addBtnsTableHeaders(
    copyDayOff2Btn,
    pasteDayOff2Btn,
    document.querySelector('table.settingstable thead th:nth-child(4)')
  );
}

async function saveDefaults(e: Event) {
  e.preventDefault();
  console.info('Saving current data as default values...');
  const slots = readInputIntoSlots();
  console.debug('Slots read:', slots);
  await GM.setValue('slots', slots);
  toast('success', 'Current values saved as defaults.');
}

function restoreDefaults(e: Event) {
  e.preventDefault();
  console.info('Restoring default values...');

async function exportData(e: Event) {
  e.preventDefault();
  console.info('Exporting current data...');
  const slots = readInputIntoSlots();
  console.debug('Slots read:', slots);
  downloadObjectAsJson(slots, 'wthermostatbeca-schedules');
  toast('success', 'Export completed.');
}

async function importData(e: Event) {
  e.preventDefault();
  console.info('Importing data...');
  const slotsStr = await askFileToRead();
  const slots = JSON.parse(slotsStr) as SlotsMap;
  writeSlotIntoInputs(slots);
  toast('success', 'Import completed.');
}

function copyDataFn(dayPrefix: DayPrefix) {
  return (e: Event) => {
    e.preventDefault();
    copyData(dayPrefix);
  };
}

function copyData(dayPrefix: DayPrefix) {
  console.info('Copying data with day prefix:', dayPrefix);
  copiedData = readInputIntoSlots(dayPrefix);
  console.debug('Data copied:', copiedData);
  toast('success', 'Data copied.');
}

function pasteDataFn(dayPrefix: DayPrefix) {
  return (e: Event) => {
    e.preventDefault();
    pasteData(dayPrefix);
  };
}

function pasteData(dayPrefix: DayPrefix) {
  console.info('Pasting data on day prefix:', dayPrefix);
  if (!copiedData) {
    toast('error', 'Copy some data first!');
    return;
  }
  const currentDayPrefix = Object.keys(copiedData)[0];
  const slots = {
    [dayPrefix]: JSON.parse(JSON.stringify(copiedData[currentDayPrefix])),
  } as SlotsMap;
  Object.keys(slots[dayPrefix]).forEach((slotIdx: SlotIdx) => {
    const slot = slots[dayPrefix][slotIdx];
    slot.namePrefix = strReplaceAt(slot.namePrefix, 0, dayPrefix);
  });
  console.debug('Pasting slots:', slots);
  writeSlotIntoInputs(slots);
  toast('success', 'Data pasted.');
}

function writeSlotIntoInputs(slots: SlotsMap): void {
  Object.keys(slots).forEach((dayPrefix: DayPrefix) => {
    const daySlots = slots[dayPrefix];
    Object.keys(daySlots).forEach((slotIdx: SlotIdx) => {
      const slot = daySlots[slotIdx];
      const timeInput = document.querySelector(
        `input[name="${slot.namePrefix}${TIME_SUFFIX}"]`
      ) as HTMLInputElement;
      const tempInput = document.querySelector(
        `input[name="${slot.namePrefix}${TEMP_SUFFIX}"]`
      ) as HTMLInputElement;
      timeInput.value = slot.time;
      tempInput.value = slot.temp;
    });
  });
}

function readInputIntoSlots(dayPrefixFilter?: DayPrefix): SlotsMap {
  const inputs = document.querySelectorAll('input');
  const slots: SlotsMap = [...inputs].reduce((obj, x) => {
    const dayPrefix = x.name.substring(0, 1) as DayPrefix;
    if (dayPrefixFilter && dayPrefix !== dayPrefixFilter) {
      return obj;
    }

    if (!obj[dayPrefix]) {
      obj[dayPrefix] = {} as DaySlots;
    }
    const daySlots = obj[dayPrefix];

    const slotIdx = x.name.substring(1, 2) as SlotIdx;
    const slot = daySlots[slotIdx] || {
      namePrefix: x.name.substring(0, 2),
    };

    if (x.name.endsWith(TIME_SUFFIX)) {
      slot.time = x.value;
    }

    if (x.name.endsWith(TEMP_SUFFIX)) {
      slot.temp = x.value;
    }

    obj[dayPrefix][slotIdx] = slot;
    return obj;
  }, {} as SlotsMap);

  return slots;
}
