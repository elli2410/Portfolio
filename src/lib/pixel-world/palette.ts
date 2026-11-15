/** The colours of the neon city. */

export const NEON = {
  mag: "#ff3fd0",
  cyan: "#38f0ff",
  yel: "#ffd23f",
  org: "#ff7a3d",
  red: "#ff3b5c",
  grn: "#5bffb6",
  vio: "#9a6bff",
  wht: "#fff2ff",
} as const;

/** Dark building walls: blue-violet with a few teal ones for variety. */
export const WALLS = [
  "#10163a",
  "#121c40",
  "#0f2440",
  "#122c42",
  "#1b1a42",
  "#2a1c3c",
  "#2c2038",
  "#13283e",
] as const;

/** Lit window colours, weighted toward warm. */
export const WIN_LIT = [
  "#ffd36a",
  "#ffd36a",
  "#ffb347",
  "#5ff3ff",
  "#ff58d8",
  "#e9e4ff",
] as const;

export const SKY = [
  "#020208",
  "#03030c",
  "#04040f",
  "#060614",
  "#0a0a1e",
  "#10102e",
  "#1a1440",
  "#2a1648",
  "#3a1a50",
] as const;
export const SKY_STOPS = [0, 0.16, 0.3, 0.42, 0.52, 0.61, 0.69, 0.76, 0.82] as const;

export const INK = "#05020f"; // the darkest dark
export const PLATE = "#0a0618"; // sign backing

export const SIGNS_H = [
  "RAMEN",
  "BAR",
  "24H",
  "OPEN",
  "HOTEL",
  "ARCADE",
  "NOODLE",
  "SAKE",
  "CAFE",
  "KARAOKE",
  "MART",
  "TEA",
  "CLUB",
  "DRINK",
  "SOBA",
  "BOOKS",
  "PIZZA",
  "BYTE",
  "ELLI DEV",
] as const;

export const SIGNS_V = ["HOTEL", "RAMEN", "OPEN", "BAR", "24H", "CLUB", "DRINK", "KARAOKE", "NEON", "ELLI"] as const;
