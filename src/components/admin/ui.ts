// Shared class names so every admin tab looks like the original Operations panel.

export const panel = 'bg-[#111] p-6 lg:p-8 rounded-2xl border border-green-500/10';

export const input =
  'w-full bg-black border border-green-500/30 p-4 rounded-lg focus:border-green-500 focus:outline-none text-white placeholder:text-green-900';

export const label = 'block text-[10px] text-green-700 uppercase font-black tracking-[0.2em] mb-2';

export const sectionTitle = 'text-xl font-bold flex items-center gap-2 text-white uppercase tracking-widest';

export const primaryButton =
  'bg-green-600 text-black font-black py-4 px-6 rounded-lg hover:bg-green-500 transition-all shadow-[0_0_30px_rgba(0,255,0,0.2)] uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed';

export const ghostButton =
  'flex items-center gap-2 bg-green-900/20 border border-green-500/50 hover:bg-green-500 hover:text-black px-4 py-2 rounded-lg transition-all font-bold text-xs uppercase disabled:opacity-40 disabled:cursor-not-allowed';

export const dangerButton =
  'flex items-center gap-2 bg-red-900/20 border border-red-500/50 hover:bg-red-500 hover:text-black px-4 py-2 rounded-lg transition-all font-bold text-xs uppercase disabled:opacity-40';

export const iconButton = 'p-2 rounded-lg transition-all disabled:opacity-20 disabled:cursor-not-allowed';

export function isLocalHost() {
  return typeof window !== 'undefined' && ['localhost', '127.0.0.1'].includes(window.location.hostname);
}

export function readFilesAsDataUrls(files: FileList | File[]): Promise<string[]> {
  return Promise.all(
    Array.from(files).map(
      (file) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(file);
        })
    )
  );
}

export type Notice = { kind: 'ok' | 'error'; text: string } | null;
