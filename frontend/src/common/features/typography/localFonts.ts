export interface TypographyPreferences {
  font_family: string;
  font_size: number;
}
export const DEFAULT_TYPOGRAPHY: TypographyPreferences = { font_family: "", font_size: 16 };
export const DEFAULT_FONT_NAME = "Segoe UI";
export const DEFAULT_FONT_STACK = '"Segoe UI", Arial, sans-serif';

const CANDIDATES = [
  "Segoe UI",
  "Arial",
  "Arial Black",
  "Aptos",
  "Calibri",
  "Cambria",
  "Candara",
  "Consolas",
  "Constantia",
  "Corbel",
  "Courier New",
  "Georgia",
  "Impact",
  "Tahoma",
  "Times New Roman",
  "Trebuchet MS",
  "Verdana",
  "Cascadia Code",
  "Cascadia Mono",
  "Comic Sans MS",
  "Franklin Gothic Medium",
  "Garamond",
  "Palatino Linotype",
  "Lucida Console",
  "Lucida Sans Unicode",
  "Helvetica",
  "Helvetica Neue",
  "Inter",
  "Roboto",
  "Noto Sans",
  "DejaVu Sans",
  "Liberation Sans",
];

export function fontStack(family: string) {
  // Quote the complete family name so punctuation cannot become CSS declarations.
  return family.trim()
    ? `${JSON.stringify(family.trim())}, ${DEFAULT_FONT_STACK}`
    : DEFAULT_FONT_STACK;
}

export function isLocalFontAvailable(family: string): boolean {
  if (!family.trim()) return true;
  if (
    /^(serif|sans-serif|monospace|cursive|fantasy|system-ui|inherit|initial|unset)$/i.test(
      family.trim(),
    )
  )
    return false;
  const context = document.createElement("canvas").getContext("2d");
  if (!context) return false;
  const sample = "mmmmmmmmmmWWWWWiiii0123456789 @# The quick brown fox";
  return ["monospace", "serif", "sans-serif"].some((fallback) => {
    context.font = `72px ${fallback}`;
    const baseline = context.measureText(sample).width;
    context.font = `72px ${JSON.stringify(family.trim())}, ${fallback}`;
    return Math.abs(context.measureText(sample).width - baseline) > 0.01;
  });
}

export function detectedLocalFonts() {
  return CANDIDATES.filter(isLocalFontAvailable).sort((a, b) => a.localeCompare(b));
}

type LocalFontWindow = Window & { queryLocalFonts?: () => Promise<Array<{ family: string }>> };
export function supportsLocalFontList() {
  return (
    window.isSecureContext && typeof (window as LocalFontWindow).queryLocalFonts === "function"
  );
}
export async function listInstalledFontFamilies(): Promise<string[]> {
  const query = (window as LocalFontWindow).queryLocalFonts;
  if (!query || !window.isSecureContext)
    throw new Error(
      "This browser cannot list all installed fonts. Choose a detected font or enter an installed font name.",
    );
  const faces = await query.call(window);
  const unique = new Map<string, string>();
  for (const face of faces) {
    const family = face.family.trim();
    if (family) unique.set(family.toLocaleLowerCase(), family);
  }
  return [...unique.values()].sort((a, b) => a.localeCompare(b));
}
