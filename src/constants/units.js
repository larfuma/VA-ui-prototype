/**
 * Unit conversion factors (to meters)
 */
export const UNIT_TO_METER = {
  m: 1,
  cm: 0.01,
  mm: 0.001,
  ft: 0.3048,
  in: 0.0254
};

/**
 * Standard eye codes for OpenEHR and SNOMED-CT
 */
export const EYE_CODES = {
  right: {
    code: "at0013",
    text: "Right eye",
    snomed: "726680007"
  },
  left: {
    code: "at0012",
    text: "Left eye",
    snomed: "726675003"
  }
};

/**
 * Valid distance units
 */
export const VALID_DISTANCE_UNITS = ["m", "cm", "mm", "ft", "in"];

/**
 * Default distances used for different VA notation types
 */
export const DEFAULT_DISTANCES = {
  "logMARDirect": { magnitude: 6, unit: "m" },
  "decimal": { magnitude: 6, unit: "m" },
  "Meter Snellen Ratio": { magnitude: 6, unit: "m" },
  "Feet Snellen Ratio": { magnitude: 20, unit: "ft" },
  "nFont": { magnitude: 35, unit: "cm" },
  "jaeger": { magnitude: 35, unit: "cm" },
  "lettersRead": { magnitude: 4, unit: "m" },
  "coded-official": { magnitude: 1, unit: "m" }
};
