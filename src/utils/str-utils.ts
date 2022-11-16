export function strReplaceAt(
  str: string,
  index: number,
  replacement: string
): string {
  return (
    str.substring(0, index) +
    replacement +
    str.substring(index + replacement.length)
  );
}
