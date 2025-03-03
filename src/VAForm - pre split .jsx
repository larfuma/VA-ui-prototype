import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  Box,
  Paper,
  Typography,
  Autocomplete,
  TextField,
  Button
} from "@mui/material";

/** 
 * Right eye => at0013 (SNOMED-CT::726680007)
 * Left eye => at0012 (SNOMED-CT::726675003)
 */
const EYE_CODES = {
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

const UNIT_TO_METER = {
  m: 1,
  cm: 0.01,
  mm: 0.001,
  ft: 0.3048,
  in: 0.0254
};

/**
 * The official mapping from the archetype’s local text to 
 * the correct code system + code from term_binding
 */
const officialCodedMap = {
  "HM - Hand movement": {
    archetypeNode: "at0152",
    codeSystem: "SNOMED-CT",
    codeString: "260295004",
    approximateLogMAR: 2.3
  },
  "CF - Count fingers": {
    archetypeNode: "at0153",
    codeSystem: "LOINC",
    codeString: "LA24679-5",
    approximateLogMAR: 1.9
  },
  "PL - Perceives Light": {
    archetypeNode: "at0154",
    codeSystem: "SNOMED-CT",
    codeString: "260296003"
    // no approximate logMAR
  },
  "PLAP - Perceives Light, accurate Projection": {
    archetypeNode: "at0155",
    codeSystem: "SNOMED-CT",
    codeString: "260297007"
  },
  "PLIP - Perceives Light, inaccurate Projection": {
    archetypeNode: "at0156",
    codeSystem: "SNOMED-CT",
    codeString: "260298002"
  },
  "NPL - No Light Perception": {
    archetypeNode: "at0161",
    codeSystem: "SNOMED-CT",
    codeString: "63063006"
  },
  "CSM - Central Steady Maintained Fixation": {
    archetypeNode: "at0157",
    codeSystem: "LOINC",
    codeString: "LA25490-6"
  },
  "CUM - Central Unsteady Maintained Fixation": {
    archetypeNode: "at0158",
    codeSystem: "LOINC",
    codeString: "LA25491-4"
  },
  "FF - Fix and Follow": {
    archetypeNode: "at0159",
    codeSystem: "LOINC",
    codeString: "LA25492-2"
  },
  "BFL - Blinks for Light": {
    archetypeNode: "at0160",
    codeSystem: "LOINC",
    codeString: "LA25493-0"
  },
  "OtO - Objection to Occlusion": {
    archetypeNode: "at0260",
    codeSystem: "local",
    codeString: "at0260"
  },
  "NI - No Improvement": {
    archetypeNode: "at0280",
    codeSystem: "local",
    codeString: "at0280"
  }
};
const OFFICIAL_CODED_ENTRIES = Object.keys(officialCodedMap);

/** 
 * N-Font => logMAR
 */
const N_FONT_MAP = {
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
 * Jaeger => logMAR
 */
const JAEGER_MAP = {
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

function decimalToLogmar(dec) {
  if (dec <= 0) return NaN;
  return -Math.log10(dec);
}
function logmarToDecimal(lm) {
  return Math.pow(10, -lm);
}

/**
 * parseResultInput(inputRaw):
 *   returns an object {valid, error?, type, ...} 
 *   with logic to handle coded strings, fraction, decimals, etc.
 */
function parseResultInput(inputRaw) {
  if (!inputRaw) {
    return { valid: false, error: "Empty input" };
  }
  let input = inputRaw.trim();

  // (A) EXACT coded
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
      Distance: {magnitude: 1, unit: "m", explicit: false}
    };
  }

  // (B) N font => e.g. "N8"
  if (/^[Nn]\d+$/.test(input)) {
    const num = parseInt(input.slice(1), 10);
    const mappedLogmar = N_FONT_MAP[num];
    if (mappedLogmar == null) {
      return { valid: false, error: `Unrecognized N-size: N${num}` };
    }
    return {
      valid: true,
      type: "nFont",
      Nvalue: num,
      logmar: mappedLogmar,
      Distance: {magnitude: 35, unit: "cm", explicit: false} // Distance was NOT explicitly entered (yet)
    };
  }

  // (C) Jaeger => "3J"
  if (/^\d+J$/i.test(input)) {
    const num = parseInt(input, 10);
    const mappedLogmar = JAEGER_MAP[num];
    if (mappedLogmar == null) {
      return { valid: false, error: `Unrecognized Jaeger: J${num}` };
    }
    return {
      valid: true,
      type: "jaeger",
      Jvalue: num,
      logmar: mappedLogmar,
      Distance: {magnitude: 35, unit: "cm", explicit: false} // Distance was NOT explicitly entered (yet)
    };
  }

  // Possibly forced distance suffix: "m" or "ft"
  let forcedDistance = null;
  if (input.toLowerCase().endsWith("m")) {
    forcedDistance = "m";
    input = input.slice(0, -1).trim();
  } else if (input.toLowerCase().endsWith("ft")) {
    forcedDistance = "ft";
    input = input.slice(0, -2).trim();
  }

 // (D) fraction => x/y
const slashCount = (input.match(/\//g) || []).length;
if (slashCount === 1) {
  const [numStr, denStr] = input.split("/").map(str => str.trim());

  if (!numStr || !denStr) {
    return { valid: false, error: "Incomplete fraction" };
  }

  const numerator = parseFloat(numStr.replace(",", "."));
  const denominator = parseFloat(denStr.replace(",", "."));

  if (isNaN(numerator) || isNaN(denominator)) {
    return { valid: false, error: "Fraction not numeric" };
  }

  let finalUnit = "Meter Snellen Ratio"; // Default unit
  let finalDistance = null; // Placeholder for distance object

  if (forcedDistance === "feet") {
    finalUnit = "Feet Snellen Ratio";
  } else if (forcedDistance === "meters") {
    finalUnit = "Meter Snellen Ratio";
  } else {
    // Determine unit based on numerator
    if (numerator === 20) {
      finalUnit = "Feet Snellen Ratio";
      finalDistance = { magnitude: 20, unit: "ft", explicit: false };
    } else if (numerator === 6) {
      finalUnit = "Meter Snellen Ratio";
      finalDistance = { magnitude: 6, unit: "m", explicit: false };
    } else {
      // If numerator is neither 20 nor 6, determine unit & distance based on forcedDistance
      const isFeet = numerator > 6; // Assume feet if numerator is large (e.g., 20)
      finalUnit = isFeet ? "Feet Snellen Ratio" : "Meter Snellen Ratio";
      finalDistance = { magnitude: numerator, unit: isFeet ? "ft" : "m", explicit: true };
    }
  }

  const decimalVA = numerator / denominator;
  const logMARval = decimalToLogmar(decimalVA);

  return {
    valid: true,
    type: finalUnit,
    numerator,
    denominator,
    decimalVA,
    logMARval,
    Distance: finalDistance
  };
} else if (slashCount > 1) {
  return { valid: false, error: "Too many slashes" };
}



  // (E) numeric => check if ends with "dec"
  let endsWithDec = false;
  let baseInput = input;
  if (input.toLowerCase().endsWith("dec")) {
    endsWithDec = true;
    baseInput = input.slice(0, -3).trim();
  }

  if (!/^[0-9.,]+$/.test(baseInput)) {
    return { valid: false, error: "Invalid characters for numeric input" };
  }
  const numericVal = parseFloat(baseInput.replace(",", "."));
  if (isNaN(numericVal)) {
    return { valid: false, error: "Cannot parse numeric" };
  }

  // integer>3 => letters read
  if (Number.isInteger(numericVal) && numericVal > 3) {
    return {
      valid: true,
      type: "lettersRead",
      letters: numericVal,
      Distance: {magnitude: 4, unit: "m", explicit: false}
    };
  }

  if (endsWithDec) {
    const logmarVal = decimalToLogmar(numericVal);
    return {
      valid: true,
      type: "decimal",
      decimalValue: numericVal,
      logMARval: logmarVal,
      Distance: {magnitude: 6, unit: "m", explicit: false}
    };
  }

  // else => interpret as direct logMAR
  const decVal = logmarToDecimal(numericVal);
  return {
    valid: true,
    type: "logMARDirect",
    logmar: numericVal,
    decimalVA: decVal,
    Distance: {magnitude: 6, unit: "m", explicit: false}
  };
}

// Additional sample suggestions so the user sees them
const RELEVANT_CODED_DISPLAYS = OFFICIAL_CODED_ENTRIES.concat([
  "6/6", "20/40ft", "0.3dec", "5", "0.18", "N8", "2J"
]);

function renderInterpretation(parseResult) {
  if (!parseResult) return null;
  if (!parseResult.valid) {
    return (
      <Typography color="error" variant="body2">
        {parseResult.error}
      </Typography>
    );
  }

  let additionalText = "";
  if (parseResult.Distance && !parseResult.Distance.explicit) {
    additionalText = `(at ${parseResult.Distance.magnitude}${parseResult.Distance.unit} implied distance)`;
  } else if (parseResult.Distance && parseResult.Distance.explicit){
     additionalText = `(at ${parseResult.Distance.magnitude}${parseResult.Distance.unit})`;
  }

  switch (parseResult.type) {
    case "coded-official":
      return (
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          Coded: {parseResult.label} (<em>{parseResult.codeSystem} {parseResult.codeString}</em>)
          {parseResult.approximateLogMAR != null && (
            <> ~ logMAR {parseResult.approximateLogMAR.toFixed(2)}</>
          )}
          {additionalText}
        </Typography>
      );
    case "nFont":
      return (
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          N-Font: N{parseResult.Nvalue}, logMAR={parseResult.logmar.toFixed(2)} {additionalText}
        </Typography>
      );
    case "jaeger":
      return (
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          Jaeger: {parseResult.Jvalue}, logMAR={parseResult.logmar.toFixed(2)} {additionalText}
        </Typography>
      );
    case "Meter Snellen Ratio":
      return (
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          Meter Snellen Ratio: {parseResult.numerator}/{parseResult.denominator} → {parseResult.snellenUnit},
          logMAR={isNaN(parseResult.logMARval) ? "N/A" : parseResult.logMARval.toFixed(2)} {additionalText}
        </Typography>
      );
    case "Feet Snellen Ratio":
      return (
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          Feet Snellen Ratio: {parseResult.numerator}/{parseResult.denominator} → {parseResult.snellenUnit},
          logMAR={isNaN(parseResult.logMARval) ? "N/A" : parseResult.logMARval.toFixed(2)} {additionalText}
        </Typography>
      );
    case "lettersRead":
      return (
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          Letters read: {parseResult.letters} {additionalText}
        </Typography>
      );
    case "decimal":
      return (
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          Decimal VA: {parseResult.decimalValue}, logMAR=
          {isNaN(parseResult.logMARval) ? "N/A" : parseResult.logMARval.toFixed(2)} {additionalText}
        </Typography>
      );
    case "logMARDirect":
      return (
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          logMAR: {parseResult.logmar.toFixed(2)}, decimal≈{" "}
          {parseResult.decimalVA.toFixed(3)} {additionalText}
        </Typography>
      );
    default:
      return null;
  }
}


/**
 * fillEyeEvent(index, parseResult, eye, comp, rawValue):
 * populates minimal composition data for that eye
 */
function fillEyeEvent(index, parseResult, eye, comp, rawValue) {
  if (!parseResult?.valid) return;

  const prefix = `va_test_template/visual_acuity_test_result/any_event:${index}`;

  // Eye code
  const eyeData = EYE_CODES[eye];
  comp[`${prefix}/eye_s_examined|value`] = eyeData.text;
  comp[`${prefix}/eye_s_examined|terminology`] = "local";
  comp[`${prefix}/eye_s_examined|code`] = eyeData.code;

  comp[`va_test_template/visual_acuity_test_result/testing_distance/quantity_value|unit`] = parseResult.Distance.unit;
  comp[`va_test_template/visual_acuity_test_result/testing_distance/quantity_value|magnitude`] = parseResult.Distance.magnitude;



  let derivedLogmar = null;
  let numericValue = null; // store numeric value here if found
  switch (parseResult.type) {
    case "coded-official":
      comp[`${prefix}/result_details/qualitative_measures|value`] = parseResult.label;
      comp[`${prefix}/result_details/qualitative_measures|terminology`] = parseResult.codeSystem;
      comp[`${prefix}/result_details/qualitative_measures|code`] = parseResult.codeString;
      derivedLogmar = parseResult.approximateLogMAR;
      break;
    case "Meter Snellen Ratio":
      comp[`${prefix}/result_details/meter_snellen_ratio|numerator`] = parseResult.numerator;
      comp[`${prefix}/result_details/meter_snellen_ratio|denominator`] = parseResult.denominator;
      comp[`${prefix}/result_details/meter_snellen_ratio|type`] = 0;
      comp[`${prefix}/result_details/meter_snellen_ratio`] = parseResult.numerator / parseResult.denominator;
      derivedLogmar = parseResult.logMARval;
      break;
    case "Feet Snellen Ratio":
      comp[`${prefix}/result_details/feet_snellen_ratio|numerator`] = parseResult.numerator;
      comp[`${prefix}/result_details/feet_snellen_ratio|denominator`] = parseResult.denominator;
      comp[`${prefix}/result_details/feet_snellen_ratio|type`] = 0;
      comp[`${prefix}/result_details/feet_snellen_ratio`] = parseResult.numerator / parseResult.denominator;
      derivedLogmar = parseResult.logMARval;
      break;
    case "decimal":
      comp[`${prefix}/result_details/decimal_notation|magnitude`] = parseResult.decimalValue;
      numericValue = parseResult.decimalValue
      derivedLogmar = parseResult.logMARval;
      break;
    case "lettersRead":
        comp[`${prefix}/result_details/number_of_recognized_optotypes|magnitude`] = parseResult.letters;
      break;
    case "logMARDirect":
      comp[`${prefix}/result_details/logmar|magnitude`] = parseResult.logmar;
      numericValue = parseResult.logmar;
      derivedLogmar = parseResult.logmar;
      break;
    case "nFont":
      comp[`${prefix}/result_details/n_font_size_notation|magnitude`] = parseResult.Nvalue;
      derivedLogmar = parseResult.logmar;
      break;
    case "jaeger":
      comp[`${prefix}/result_details/jaeger_font_size_notation|magnitude`] = parseResult.Jvalue;
      derivedLogmar = parseResult.logmar;
      break;
    default:
        comp[`${prefix}/result_details/qualitative_measures|value`] = rawValue;
      break;
  }
  
  //Derived value (always logMar in this demonstra):
  if (derivedLogmar != null && !isNaN(derivedLogmar)) {
      comp[`${prefix}/result_details/derived_result/logmar|magnitude`] = derivedLogmar;

    }


}

function parseDistanceInput(inputRaw) {
  if (!inputRaw) {
    return { valid: false, error: "Empty Input" };// invalid if empty, will take default value
  }
  let input = inputRaw.trim();

  // Check if the input ends with a valid unit
  const unitMatch = input.match(/([a-zA-Z]+)$/);
  if (!unitMatch) {
    return { valid: false, error: "Missing unit (e.g., m, cm, mm, ft, in)" };
  }
  const unit = unitMatch[1].toLowerCase();
    if (!["m", "cm", "mm", "ft", "in"].includes(unit)) {
        return { valid: false, error: `Invalid unit: ${unit}, should be m, cm, mm, ft or in` };
  }

  // Extract the magnitude
  const magnitudeStr = input.slice(0, -unit.length).trim();
  const magnitude = parseFloat(magnitudeStr.replace(",", "."));
  if (isNaN(magnitude)) {
    return { valid: false, error: "Invalid magnitude" };
  }

  return {
    valid: true,
    magnitude,
    unit,
      explicit: true
  };
}

function convertDistance(magnitude, fromUnit, toUnit) {
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
 *
 * The formula is:
 *   newLogMAR = initialLogMAR + log10(newDistance / convertedInitialDistance)
 * where convertedInitialDistance is the initial distance converted to the same unit as newDistance.
 */
function calculateLogMARAtDistance(initialLogMAR, initialDistance, newDistance) {
  // Convert the initial distance into the unit of newDistance
  const convertedInitial = convertDistance(initialDistance.magnitude, initialDistance.unit, newDistance.unit);
  // Calculate the ratio and update logMAR value
  return initialLogMAR + Math.log10(convertedInitial/newDistance.magnitude);
}


export default function VAResultUnitForm() {
  const { control, handleSubmit, watch, setValue } = useForm({
    defaultValues: {
      rightEyeValue: "",
      leftEyeValue: "",
      rightEyeDistance: "", // New: input field for distance
      leftEyeDistance: ""    // New: input field for distance
    }
  });

  const [rightParse, setRightParse] = useState(null);
  const [leftParse, setLeftParse] = useState(null);
  const [rightDistanceParse, setRightDistanceParse] = useState(null) // New state for distance parsing
  const [leftDistanceParse, setLeftDistanceParse] = useState(null)   // New state for distance parsing

  const rightVal = watch("rightEyeValue");
  const leftVal = watch("leftEyeValue");
  const rightDistance = watch("rightEyeDistance") // New: watched distance value
  const leftDistance = watch("leftEyeDistance")   // New: watched distance value

  useEffect(() => {
    const newParse = parseResultInput(rightVal);
    setRightParse(newParse);
  }, [rightVal]);

  useEffect(() => {
      const newParse = parseResultInput(leftVal);
      setLeftParse(newParse);
  }, [leftVal]);

   useEffect(() => {
      setRightDistanceParse(parseDistanceInput(rightDistance));
    }, [rightDistance]);

    useEffect(() => {
        setLeftDistanceParse(parseDistanceInput(leftDistance));
    }, [leftDistance]);
    
    useEffect(() => {
      if (rightParse?.valid &&  rightParse?.Distance) {
          let newLogMar = rightParse.logmar;
          let newDistance = rightParse.Distance;
          if(rightDistanceParse?.valid && rightDistanceParse.explicit){
              newDistance = rightDistanceParse;
              if(rightParse.type !== "coded-official" && rightParse.type!=="lettersRead"){
                const initialDistance = rightParse.Distance;
                newLogMar = calculateLogMARAtDistance(rightParse.logmar, initialDistance, newDistance);
              }
          }
         setRightParse({...rightParse, logmar: newLogMar, Distance: {...newDistance, explicit: newDistance.explicit}});
      }
    }, [rightDistanceParse, rightParse]);
     useEffect(() => {
      if (leftParse?.valid && leftParse?.Distance) {
         let newLogMar = leftParse.logmar;
         let newDistance = leftParse.Distance;
        if(leftDistanceParse?.valid && leftDistanceParse.explicit){
              newDistance = leftDistanceParse;
              if(leftParse.type !== "coded-official" && leftParse.type!=="lettersRead"){
                 const initialDistance = leftParse.Distance;
                  newLogMar = calculateLogMARAtDistance(leftParse.logmar, initialDistance, newDistance);
              }
        }
         setLeftParse({...leftParse, logmar: newLogMar, Distance: {...newDistance, explicit: newDistance.explicit}});
      }
    }, [leftDistanceParse, leftParse]);

  const [finalComposition, setFinalComposition] = useState(null);

  function getSuggestions(value) {
    if (!value) return [];
    const lower = value.toLowerCase();
    return OFFICIAL_CODED_ENTRIES.filter((entry) =>
      entry.toLowerCase().includes(lower)
    );
  }
  const rightSuggestions = getSuggestions(rightVal);
  const leftSuggestions = getSuggestions(leftVal);

  function handleEnterIfSingleSuggestion(evt, suggestionsArr, setField) {
    if (evt.key === "Enter" && suggestionsArr.length === 1) {
      evt.preventDefault();
      setField(suggestionsArr[0]);
    }
  }

  const onSubmit = () => {
    // minimal composition object
    const composition = {
      "va_test_template/category|value": "event",
      "va_test_template/category|terminology": "openehr",
      "va_test_template/category|code": "433",
    };

    // fill right => any_event:0
    if (rightParse?.valid && rightDistanceParse?.valid) {
      fillEyeEvent(0, rightParse, "right", composition, rightVal);
    }
    // fill left => any_event:1
    if (leftParse?.valid && leftDistanceParse?.valid) {
      fillEyeEvent(1, leftParse, "left", composition, leftVal);
    }

    setFinalComposition(composition);
    console.log("Final Composition:", composition);
  };

  return (
    <Paper sx={{ p: 3, m: 2 }}>
      <Typography variant="h3" gutterBottom>
        OpenEHR VA Template UI - very early prototype of unit recognition
      </Typography>

      {/* Examples for each notation */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="body1" sx={{ fontWeight: 600 }}>
          Examples by unit/type:
        </Typography>
        <ul style={{ marginTop: 0 }}>
          <li><strong>logMAR (default) </strong>: "0.18"</li>
          <li><strong>Snellen Fraction (meter)</strong>: "6/6"</li>
          <li><strong>Snellen Fraction (feet)</strong>: "20/40ft"</li>
          <li><strong>Decimal Notation</strong>: "0.5dec"</li>
          <li><strong>Letters Read (assumed for integers above 2)</strong>: "5"</li>
          <li><strong>Jaeger</strong>: "3J"</li>
          <li><strong>N-Font</strong>: "N8"</li>
          <li><strong>Coded entries - just type and choose</strong>: "HM - Hand movement", "CF - Count fingers", "PL - Perceives Light", etc.</li>
        </ul>
      </Box>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Box sx={{ display: "flex", gap: 3, mb: 2 }}>
          {/* RIGHT Eye */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6">Right Eye</Typography>
            <Controller
              name="rightEyeValue"
              control={control}
              render={({ field: { onChange, onBlur, value } }) => {
                const isInvalid = rightParse && !rightParse.valid && value.length > 0;
                return (
                  <>
                    <Autocomplete
                      freeSolo
                      options={rightSuggestions}
                      inputValue={value}
                      onKeyDown={(evt) =>
                        handleEnterIfSingleSuggestion(evt, rightSuggestions, onChange)
                      }
                      onInputChange={(_evt, newVal, reason) => {
                        if (reason === "selectOption") onChange(newVal);
                        else onChange(newVal);
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          onBlur={onBlur}
                          label="Right Eye VA"
                          placeholder='e.g. 6/6, 0.3dec, HM - Hand movement'
                          error={isInvalid}
                          helperText={isInvalid ? rightParse?.error : ""}
                        />
                      )}
                    />
                    {/* Live interpretation */}
                    <Box sx={{ mt: 1 }}>{renderInterpretation(rightParse)}</Box>
                  </>
                );
              }}
            />
          </Box>
          {/* Right Eye Distance */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6">Right Eye Distance</Typography>
            <Controller
              name="rightEyeDistance"
              control={control}
              render={({ field: { onChange, onBlur, value } }) => {
                  const isInvalid = rightDistanceParse && !rightDistanceParse.valid && value.length > 0;
                return(
                  <TextField
                  onBlur={onBlur}
                  label="Distance"
                  placeholder='e.g. 22mm, 35cm'
                  value={value}
                  onChange={onChange}
                  error={isInvalid}
                  helperText={isInvalid ? rightDistanceParse?.error : ""}
                  />)
              }}
              />
          </Box>

          {/* LEFT Eye */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6">Left Eye</Typography>
            <Controller
              name="leftEyeValue"
              control={control}
              render={({ field: { onChange, onBlur, value } }) => {
                const isInvalid = leftParse && !leftParse.valid && value.length > 0;
                return (
                  <>
                    <Autocomplete
                      freeSolo
                      options={leftSuggestions}
                      inputValue={value}
                      onKeyDown={(evt) =>
                        handleEnterIfSingleSuggestion(evt, leftSuggestions, onChange)
                      }
                      onInputChange={(_evt, newVal, reason) => {
                        if (reason === "selectOption") onChange(newVal);
                        else onChange(newVal);
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          onBlur={onBlur}
                          label="Left Eye VA"
                          placeholder='e.g. 20/40ft, CF - Count fingers, N8'
                          error={isInvalid}
                          helperText={isInvalid ? leftParse?.error : ""}
                        />
                      )}
                    />
                    {/* Live interpretation */}
                    <Box sx={{ mt: 1 }}>{renderInterpretation(leftParse)}</Box>
                  </>
                );
              }}
            />
          </Box>

          {/* Left Eye Distance */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6">Left Eye Distance</Typography>
            <Controller
              name="leftEyeDistance"
              control={control}
              render={({ field: { onChange, onBlur, value } }) => {
                const isInvalid = leftDistanceParse && !leftDistanceParse.valid && value.length > 0;
                return(
                  <TextField
                    onBlur={onBlur}
                    label="Distance"
                    placeholder='e.g. 22mm, 35cm'
                    value={value}
                    onChange={onChange}
                    error={isInvalid}
                    helperText={isInvalid ? leftDistanceParse?.error : ""}
                  />)
              }}
            />
          </Box>
        </Box>

        <Button variant="contained" type="submit">
          Build Composition
        </Button>
      </form>

      {/* Display final composition if available */}
      {finalComposition && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h5">Resulting Composition</Typography>
          <pre style={{ background: "#f9f9f9", padding: 10 }}>
            {JSON.stringify(finalComposition, null, 2)}
          </pre>
        </Box>
      )}
    </Paper>
  );
}