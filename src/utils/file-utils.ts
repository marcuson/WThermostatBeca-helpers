export async function askFileToRead(): Promise<string> {
  const input = document.createElement('input');
  input.type = 'file';

  const prom = new Promise<string>((res, rej) => {
    input.onchange = () => {
      const file = input.files[0];

      const reader = new FileReader();
      reader.readAsText(file, 'UTF-8');

      reader.onload = (readerEvent) => {
        const content = readerEvent.target.result as string;
        res(content);
      };

      reader.onerror = (err) => {
        rej(err);
      };
    };
  });

  input.setAttribute('style', 'display:none;');
  document.body.appendChild(input); // required for firefox
  input.click();

  const res = await prom;
  input.remove();
  return res;
}
