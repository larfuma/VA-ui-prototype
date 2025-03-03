import { OFFICIAL_CODED_ENTRIES, officialCodedMap } from '../constants/codedValues';
import { DEFAULT_DISTANCES, VALID_DISTANCE_UNITS } from '../constants/units';
import { ALL_PARAMETER_TYPES } from '../constants/correctionTypes';
import { decimalToLogMAR } from './converters';

/**
 * Main function to parse a visual acuity input string
 */
export function parseResultInput(inputRaw) {
  if (!inputRaw) {
    return { valid: false, error: "Empty input" };
  }
  let input = inputRaw.trim();

  // (A) EXACT coded entry (HM, CF, etc.)
  const codedResult = parseCodedEntry(input);
  if (codedResult.valid) return codedResult;

  // (B) N font notation (e.g. "N8")
  const nFontResult = parseNFont(input);
  if (nFontResult.valid) return nFontResult;

  // (C) Jaeger notation (e.g. "3J")
  const jaegerResult = parseJaeger(input);
  if (jaegerResult.valid) return jaegerResult;

  // Check for forced distance suffix
  const { input: adjustedInput, forcedDistance } = extractForcedDistance(input);
  
  // (D) Fraction notation (e.g. "6/6", "20/40")
  const fractionResult = parseFraction(adjustedInput, forcedDistance);
  if (fractionResult.valid) return fractionResult;

  // (E) Decimal notation or direct logMAR
  return parseDecimalOrLogMAR(adjustedInput);
}

/**
 * Parse coded entries (HM, CF, etc.)
 */
function parseCodedEntry(input) {
  const codedEntry = OFFICIAL_CODED_ENTRIES.find(
    (k) => k.toLowerCase() === input.toLowerCase()
  );
  
  if (codedEntry) {
    return {
      valid: true,
      type: "coded-official",
      label: codedEntry,
      codeSystem: officialCodedMap[codedEntry].codeSystem,
      codeString: officialCodedMap[codedEntry].codeString,
      approximateLogMAR: officialCodedMap[codedEntry].approximateLogMAR || null,
      Distance: { ...DEFAULT_DISTANCES["coded-official"], explicit: false }
    };
  }
  
  return { valid: false };
}

/**
 * Parse N-font notation (e.g. "N8")
 */
function parseNFont(input) {
  if (/^[Nn]\d+$/.test(input)) {
    const num = parseInt(input.slice(1), 10);
    return {
      valid: true,
      type: "nFont",
      Nvalue: num,
      Distance: { ...DEFAULT_DISTANCES["nFont"], explicit: false }
    };
  }
  
  return { valid: false };
}

/**
 * Parse Jaeger notation (e.g. "3J")
 */
function parseJaeger(input) {
  if (/^\d+[Jj]$/.test(input)) {
    const num = parseInt(input, 10);
    return {
      valid: true,
      type: "jaeger",
      Jvalue: num,
      Distance: { ...DEFAULT_DISTANCES["jaeger"], explicit: false }
    };
  }
  
  return { valid: false };
}

/**
 * Extract forced distance unit from input if present
 */
function extractForcedDistance(input) {
  // Check for distance suffix like "m" or "ft"
  let forcedDistance = null;
  let adjustedInput = input;
  
  if (input.toLowerCase().endsWith("m")) {
    forcedDistance = "m";
    adjustedInput = input.slice(0, -1).trim();
  } else if (input.toLowerCase().endsWith("ft")) {
    forcedDistance = "ft";
    adjustedInput = input.slice(0, -2).trim();
  }
  
  return { input: adjustedInput, forcedDistance };
}


/**
 * Parse fraction notation (e.g. "6/6", "20/40")
 */
function parseFraction(input, forcedDistance) {
  const slashCount = (input.match(/\//g) || []).length;
  
  if (slashCount !== 1) {
    return { valid: false };
  }
  
  const [numStr, denStr] = input.split("/").map(str => str.trim());
  
  if (!numStr || !denStr) {
    return { valid: false, error: "Incomplete fraction" };
  }
  
  const numerator = parseFloat(numStr.replace(",", "."));
  const denominator = parseFloat(denStr.replace(",", "."));
  
  if (isNaN(numerator) || isNaN(denominator)) {
    return { valid: false, error: "Fraction not numeric" };
  }
  
  // Determine whether this is meters or feet based on numerator
  let finalUnit = "Meter Snellen Ratio";
  let finalDistance = null;
  
  if (forcedDistance === "ft") {
    finalUnit = "Feet Snellen Ratio";
    finalDistance = { magnitude: numerator, unit: "ft", explicit: true };
  } else if (forcedDistance === "m") {
    finalUnit = "Meter Snellen Ratio";
    finalDistance = { magnitude: numerator, unit: "m", explicit: true };
  } else {
    // Automatic detection based on numerator
    if (numerator === 20) {
      finalUnit = "Feet Snellen Ratio";
      finalDistance = { magnitude: 20, unit: "ft", explicit: false };
    } else if (numerator === 6) {
      finalUnit = "Meter Snellen Ratio";
      finalDistance = { magnitude: 6, unit: "m", explicit: false };
    } else {
      // If numerator is neither 20 nor 6, use explicit value
      const isFeet = numerator > 6; // Assume feet if numerator is large
      finalUnit = isFeet ? "Feet Snellen Ratio" : "Meter Snellen Ratio";
      finalDistance = { 
        magnitude: numerator, 
        unit: isFeet ? "ft" : "m", 
        explicit: true 
      };
    }
  }
  
  return {
    valid: true,
    type: finalUnit,
    numerator,
    denominator,
    decimalVA: numerator / denominator,
    Distance: finalDistance
  };
}

/**
 * Parse decimal notation or direct logMAR (e.g. "0.5dec", "0.3")
 */
function parseDecimalOrLogMAR(input) {
  // Check if explicit decimal notation
  let isDecimal = false;
  let adjustedInput = input;
  
  if (input.toLowerCase().endsWith("dec")) {
    isDecimal = true;
    adjustedInput = input.slice(0, -3).trim();
  }
  
  // Validate numeric format
  if (!/^-?[0-9.,]+$/.test(adjustedInput)) {
    return { valid: false, error: "Invalid characters for numeric input" };
  }
  
  const numericVal = parseFloat(adjustedInput.replace(",", "."));
  if (isNaN(numericVal)) {
    return { valid: false, error: "Cannot parse numeric" };
  }
  
  // Integer > 3 is interpreted as letters read
  if (Number.isInteger(numericVal) && numericVal > 3) {
    return {
      valid: true,
      type: "lettersRead",
      letters: numericVal,
      Distance: { ...DEFAULT_DISTANCES["lettersRead"], explicit: false }
    };
  }
  
  // Explicit decimal notation
  if (isDecimal) {
    return {
      valid: true,
      type: "decimal",
      decimalValue: numericVal,
      Distance: { ...DEFAULT_DISTANCES["decimal"], explicit: false }
    };
  }
  
  // Default: interpret as logMAR
  return {
    valid: true,
    type: "logMARDirect",
    logmar: numericVal,
    Distance: { ...DEFAULT_DISTANCES["logMARDirect"], explicit: false }
  };
}

/**
 * Parse diopter value with special shortcuts (q=0.25, h=0.5, t=0.75)
 * Examples: 1q -> 1.25, 1h -> 1.5, -3t -> -3.75
 */
export function parseDiopterValue(inputRaw) {
  if (!inputRaw) {
    return { valid: false, error: "Empty input" };
  }
  
  let input = inputRaw.trim();
  
  // Check for special shorthand notation
  if (/^[+-]?\d+q$/i.test(input)) {
    // q = 0.25 (quarter)
    const baseNumber = parseFloat(input.slice(0, -1));
    return {
      valid: true,
      value: baseNumber + (baseNumber >= 0 ? 0.25 : -0.25),
      shorthand: 'q'
    };
  } else if (/^[+-]?\d+h$/i.test(input)) {
    // h = 0.5 (half)
    const baseNumber = parseFloat(input.slice(0, -1));
    return {
      valid: true,
      value: baseNumber + (baseNumber >= 0 ? 0.5 : -0.5),
      shorthand: 'h'
    };
  } else if (/^[+-]?\d+t$/i.test(input)) {
    // t = 0.75 (three-quarters)
    const baseNumber = parseFloat(input.slice(0, -1));
    return {
      valid: true,
      value: baseNumber + (baseNumber >= 0 ? 0.75 : -0.75),
      shorthand: 't'
    };
  }
  
  // Standard numeric value
  if (/^[+-]?\d+(\.\d+)?$/.test(input)) {
    const numValue = parseFloat(input);
    return {
      valid: true,
      value: numValue
    };
  }
  
  return { valid: false, error: "Invalid diopter format" };
}
/**
 * Parse multi-purpose input for distance or corrections
 * @param {string} inputRaw - The raw input string
 * @param {Array<string>} correctionTypes - Array of valid correction types
 * @returns {Object} - Parsed result
 */
/**
 * Parse multi-purpose input for distance or corrections
 * @param {string} inputRaw - The raw input string
 * @param {Array<string>} parameterTypes - Array of valid parameter types
 * @returns {Object} - Parsed result
 */
export function parseTestParameterInput(inputRaw, parameterTypes) {
  if (!inputRaw) {
    return { valid: false, error: "Empty input" };
  }
  
  let input = inputRaw.trim();
  
  // First, try to parse as distance
  const distanceResult = parseDistanceInput(input);
  if (distanceResult.valid) {
    return {
      ...distanceResult,
      type: 'distance'
    };
  }
  
  // Check for correction types (including chart types, methods, etc.)
  const matchedParam = parameterTypes.find(
    param => param.toLowerCase() === input.toLowerCase()
  );
  
  if (matchedParam) {
    // Determine the type of parameter
    if (matchedParam.includes("chart") || matchedParam.endsWith("chart")) {
      return {
        valid: true,
        type: 'chartType',
        value: matchedParam
      };
    } else if (
      matchedParam.includes("Lenses") || 
      matchedParam.includes("Glasses") || 
      matchedParam.includes("Contact") || 
      matchedParam.includes("Pinhole") || 
      matchedParam.includes("Occluder") ||
      matchedParam === "None - Uncorrected"
    ) {
      return {
        valid: true,
        type: 'correction',
        value: matchedParam
      };
    } else if (
      matchedParam.includes("E") ||
      matchedParam.includes("Symbol") ||
      matchedParam.includes("Letter") ||
      matchedParam.includes("Number") ||
      matchedParam.includes("Picture") ||
      matchedParam.includes("Landolt C") ||
      matchedParam === "Pictogramm" ||
      matchedParam === "Orientation-Type Optotypes"
    ) {
      return {
        valid: true,
        type: 'optotype',
        value: matchedParam
      };
    } else {
      // Default to method (anything else)
      return {
        valid: true,
        type: 'method',
        value: matchedParam
      };
    }
  }
  
  // If we get here, the input couldn't be parsed
  return { 
    valid: false, 
    error: "Input not recognized as a valid parameter" 
  };
}

/**
 * Parse distance input (e.g. "6m", "35cm")
 */
export function parseDistanceInput(inputRaw) {
  if (!inputRaw) {
    return { valid: false, error: "Empty input" };
  }
  
  let input = inputRaw.trim();
  
  // Check for valid unit suffix
  const unitMatch = input.match(/([a-zA-Z]+)$/);
  if (!unitMatch) {
    return { valid: false, error: "Missing unit (e.g., m, cm, mm, ft, in)" };
  }
  
  const unit = unitMatch[1].toLowerCase();
  if (!VALID_DISTANCE_UNITS.includes(unit)) {
    return { 
      valid: false, 
      error: `Invalid unit: ${unit}, use: ${VALID_DISTANCE_UNITS.join(', ')}` 
    };
  }
  
  // Extract and validate magnitude
  const magnitudeStr = input.slice(0, -unit.length).trim();
  const magnitude = parseFloat(magnitudeStr.replace(",", "."));
  
  if (isNaN(magnitude)) {
    return { valid: false, error: "Invalid magnitude" };
  }
  
  if (magnitude <= 0) {
    return { valid: false, error: "Distance must be positive" };
  }
  
  return {
    valid: true,
    magnitude,
    unit,
    explicit: true
  };
}