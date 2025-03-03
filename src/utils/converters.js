import { UNIT_TO_METER } from '../constants/units';
import { N_FONT_MAP, JAEGER_MAP } from '../constants/notationMaps';

/**
 * Convert decimal visual acuity to logMAR
 * @param {number} dec - Decimal visual acuity
 * @returns {number} - LogMAR value
 */
export function decimalToLogMAR(dec) {
  if (dec <= 0) return NaN;
  return -Math.log10(dec);
}

/**
 * Convert logMAR to decimal visual acuity
 * @param {number} lm - LogMAR value
 * @returns {number} - Decimal visual acuity
 */
export function logMARToDecimal(lm) {
  return Math.pow(10, -lm);
}

/**
 * Convert N-Font notation to logMAR
 * @param {number} nValue - N-Font value 
 * @returns {number|null} - LogMAR value or null if conversion not available
 */
export function nFontToLogMAR(nValue) {
  return N_FONT_MAP[nValue] || null;
}

/**
 * Convert Jaeger notation to logMAR
 * @param {number} jValue - Jaeger value
 * @returns {number|null} - LogMAR value or null if conversion not available
 */
export function jaegerToLogMAR(jValue) {
  return JAEGER_MAP[jValue] || null;
}

/**
 * Convert distance from one unit to another
 * @param {number} magnitude - The value to convert
 * @param {string} fromUnit - The source unit (e.g., 'm', 'cm')
 * @param {string} toUnit - The target unit
 * @returns {number} - The converted value
 */
export function convertDistance(magnitude, fromUnit, toUnit) {
  // First convert the value to meters
  const valueInMeters = magnitude * UNIT_TO_METER[fromUnit];
  // Then convert meters to the target unit
  return valueInMeters / UNIT_TO_METER[toUnit];
}

/**
 * Calculate the new logMAR value when the viewing distance changes.
 * @param {number} initialLogMAR - The logMAR value at the initial distance.
 * @param {Object} initialDistance - An object with properties { magnitude, unit } for the initial distance.
 * @param {Object} newDistance - An object with properties { magnitude, unit } for the new distance.
 * @returns {number} The new logMAR value.
 */
export function calculateLogMARAtDistance(initialLogMAR, initialDistance, newDistance) {
  // Convert both distances to the same unit
  const initialInMeters = initialDistance.magnitude * UNIT_TO_METER[initialDistance.unit];
  const newInMeters = newDistance.magnitude * UNIT_TO_METER[newDistance.unit];
  
  // Calculate the ratio and update logMAR value
  return initialLogMAR + Math.log10(initialInMeters / newInMeters);
}

/**
 * Snellen ratio to decimal VA
 * @param {number} numerator - Numerator of Snellen ratio
 * @param {number} denominator - Denominator of Snellen ratio
 * @returns {number} - Decimal visual acuity
 */
export function snellenToDecimal(numerator, denominator) {
  return numerator / denominator;
}

/**
 * Snellen ratio to logMAR
 * @param {number} numerator - Numerator of Snellen ratio
 * @param {number} denominator - Denominator of Snellen ratio
 * @returns {number} - LogMAR value
 */
export function snellenToLogMAR(numerator, denominator) {
  const decimalVA = snellenToDecimal(numerator, denominator);
  return decimalToLogMAR(decimalVA);
}
