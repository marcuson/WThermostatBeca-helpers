import { IToastOptions, IToastResult } from '@violentmonkey/ui';
import globalStyle from '../style.css';
import styles, { stylesheet } from '../style.module.css';

export type ToastType = 'success' | 'warning' | 'error';

export function toast(
  type: ToastType,
  msg: string,
  options?: IToastOptions
): IToastResult {
  const clz = styles[type];
  const st = [options?.style || '', globalStyle, stylesheet].join('\n');
  return VM.showToast(
    <div class={clz}>
      <p>{msg}</p>
    </div>,
    { ...options, style: st }
  );
}
