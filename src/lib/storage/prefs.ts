import { Capacitor } from "@capacitor/core";
import { Preferences } from "@capacitor/preferences";

export async function getPref(key: string): Promise<string | null> {
  if (Capacitor.isNativePlatform()) return (await Preferences.get({ key })).value;
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(`lotador.pref.${key}`);
}

export async function setPref(key: string, value: string): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    await Preferences.set({ key, value });
    return;
  }
  if (typeof window !== "undefined") window.localStorage.setItem(`lotador.pref.${key}`, value);
}

export async function removePref(key: string): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    await Preferences.remove({ key });
    return;
  }
  if (typeof window !== "undefined") window.localStorage.removeItem(`lotador.pref.${key}`);
}
