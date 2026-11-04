export type Theme = "light" | "dark" | "system";
export const THEME_STORAGE_KEY = "theme";

/**
 * Runs before first paint (inlined in <head>) so the page never flashes the wrong theme.
 * Keep it dependency-free and tiny; it is serialized as a string.
 */
export const themeInitScript = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");var d=t==="dark"||((!t||t==="system")&&matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d)}catch(e){}})()`;

export function resolveDark(theme: Theme, systemPrefersDark: boolean) {
  return theme === "dark" || (theme === "system" && systemPrefersDark);
}
