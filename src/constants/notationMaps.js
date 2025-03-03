/**
 * N-Font => logMAR conversion mapping
 */
export const N_FONT_MAP = {
  4: 0.07,
  5: 0.1,
  6: 0.11,
  8: 0.14,
  10: 0.18,
  12: 0.22,
  16: 0.3,
  20: 0.35,
  24: 0.44,
  30: 0.52
};

/**
 * Jaeger => logMAR conversion mapping
 */
export const JAEGER_MAP = {
  1: 0.0,
  2: 0.1,
  3: 0.18,
  4: 0.2,
  5: 0.3,
  6: 0.4,
  7: 0.48,
  8: 0.5,
  9: 0.6,
  10: 0.7,
  11: 0.76,
  12: 0.8,
  13: 0.9,
  14: 1.0
};

/**
 * Notation examples by category for the help section
 */
export const NOTATION_EXAMPLES = [
  { label: "logMAR (default)", example: "0.18" },
  { label: "Snellen Fraction (meter)", example: "6/6" },
  { label: "Snellen Fraction (feet)", example: "20/40ft" },
  { label: "Decimal Notation", example: "0.5dec" },
  { label: "Letters Read (assumed for integers above 2)", example: "5" },
  { label: "Jaeger", example: "3J" },
  { label: "N-Font", example: "N8" },
  { label: "Coded entries", example: "HM - Hand movement, CF - Count fingers, etc." }
];
