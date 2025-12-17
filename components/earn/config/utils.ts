import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const playSound = (
  type:
    | "click"
    | "win"
    | "spin"
    | "crack"
    | "flip"
    | "fail"
    | "crit"
    | "shake"
    | "open"
) => {
  // const audio = new Audio(`/sounds/${type}.mp3`); audio.play().catch(() => {});
};
