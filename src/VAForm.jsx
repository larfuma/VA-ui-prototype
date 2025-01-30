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
      approximateLogMAR: officialCodedMap[codedEntry].approximateLogMAR || null
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
      decimalVA: logmarToDecimal(mappedLogmar)
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
      decimalVA: logmarToDecimal(mappedLogmar)
    };
  }

  // Possibly forced distance suffix: "m" or "ft"
  let forcedDistance = null;
  if (input.toLowerCase().endsWith("m")) {
    forcedDistance = "meters";
    input = input.slice(0, -1).trim();
  } else if (input.toLowerCase().endsWith("ft")) {
    forcedDistance = "feet";
    input = input.slice(0, -2).trim();
  }

  // (D) fraction => x/y
  const slashCount = (input.match(/\//g) || []).length;
  if (slashCount === 1) {
    const [numStr, denStr] = input.split("/");
    if (!numStr || !denStr) {
      return { valid: false, error: "Incomplete fraction" };
    }
    const numerator = parseFloat(numStr.replace(",", "."));
    const denominator = parseFloat(denStr.replace(",", "."));
    if (isNaN(numerator) || isNaN(denominator)) {
      return { valid: false, error: "Fraction not numeric" };
    }
    let finalUnit = "Meter Snellen Ratio"; // default
    if (forcedDistance === "feet") finalUnit = "Feet Snellen Ratio";
    else if (forcedDistance === "meters") finalUnit = "Meter Snellen Ratio";
    else {
      // if numerator=20 => feet, if 6 => meters
      if (numerator === 20) finalUnit = "Feet Snellen Ratio";
      else if (numerator === 6) finalUnit = "Meter Snellen Ratio";
    }
    const decimalVA = numerator / denominator;
    const logMARval = decimalToLogmar(decimalVA);
    return {
      valid: true,
      type: "fraction",
      numerator,
      denominator,
      snellenUnit: finalUnit,
      decimalVA,
      logMARval
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
      letters: numericVal
    };
  }

  if (endsWithDec) {
    const logmarVal = decimalToLogmar(numericVal);
    return {
      valid: true,
      type: "decimal",
      decimalValue: numericVal,
      logMARval: logmarVal
    };
  }

  // else => interpret as direct logMAR
  const decVal = logmarToDecimal(numericVal);
  return {
    valid: true,
    type: "logMARDirect",
    logmar: numericVal,
    decimalVA: decVal
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
  switch (parseResult.type) {
    case "coded-official":
      return (
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          Coded: {parseResult.label} (<em>{parseResult.codeSystem} {parseResult.codeString}</em>)
          {parseResult.approximateLogMAR != null && (
            <> ~ logMAR {parseResult.approximateLogMAR.toFixed(2)}</>
          )}
        </Typography>
      );
    case "nFont":
      return (
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          N-Font: N{parseResult.Nvalue}, logMAR={parseResult.logmar.toFixed(2)}
        </Typography>
      );
    case "jaeger":
      return (
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          Jaeger: {parseResult.Jvalue}, logMAR={parseResult.logmar.toFixed(2)}
        </Typography>
      );
    case "fraction":
      return (
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          Fraction: {parseResult.numerator}/{parseResult.denominator} → {parseResult.snellenUnit}, 
          logMAR={isNaN(parseResult.logMARval) ? "N/A" : parseResult.logMARval.toFixed(2)}
        </Typography>
      );
    case "lettersRead":
      return (
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          Letters read: {parseResult.letters}
        </Typography>
      );
    case "decimal":
      return (
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          Decimal VA: {parseResult.decimalValue}, logMAR=
          {isNaN(parseResult.logMARval) ? "N/A" : parseResult.logMARval.toFixed(2)}
        </Typography>
      );
    case "logMARDirect":
      return (
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          logMAR: {parseResult.logmar.toFixed(2)}, decimal≈{" "}
          {parseResult.decimalVA.toFixed(3)}
        </Typography>
      );
    default:
      return null;
  }
}

/**
 * fillEyeEvent(index, parseResult, eye, comp):
 * populates minimal composition data for that eye
 */
function fillEyeEvent(index, parseResult, eye, comp, rawValue) {
  if (!parseResult?.valid) return;

  const prefix = `test_va_2/visual_acuity_test_result/any_event:${index}`;

  // Eye code
  const eyeData = EYE_CODES[eye];
  comp[`${prefix}/eye_s_examined|value`] = eyeData.text;
  comp[`${prefix}/eye_s_examined|terminology`] = "local";
  comp[`${prefix}/eye_s_examined|code`] = eyeData.code;

  // The actual result stored under:
  const resultValKey = `${prefix}/result_details/result/coded_text_value|value`;
  const resultTermKey = `${prefix}/result_details/result/coded_text_value|terminology`;
  const resultCodeKey = `${prefix}/result_details/result/coded_text_value|code`;

  // default unit => logMAR = at0165
  let unitCode = "at0165";
  let unitValue = "logMAR";
  let derivedLogmar = null;

  switch (parseResult.type) {
    case "coded-official":
      comp[resultValKey] = parseResult.label;
      comp[resultTermKey] = parseResult.codeSystem;
      comp[resultCodeKey] = parseResult.codeString;
      derivedLogmar = parseResult.approximateLogMAR;
      // keep default "logMAR" if we have approximate. else no numeric 
      break;
    case "fraction": {
      comp[resultValKey] = `${parseResult.numerator}/${parseResult.denominator}`;
      comp[resultTermKey] = "local";
      comp[resultCodeKey] = "at0152"; // fallback local code
      // pick unit code
      if (parseResult.snellenUnit === "Meter Snellen Ratio") {
        unitCode = "at0171";
        unitValue = "Meter Snellen Ratio";
      } else {
        unitCode = "at0172";
        unitValue = "Feet Snellen Ratio";
      }
      derivedLogmar = parseResult.logMARval;
      break;
    }
    case "decimal": {
      comp[resultValKey] = parseResult.decimalValue.toString();
      comp[resultTermKey] = "local";
      comp[resultCodeKey] = "at0152";
      unitCode = "at0168"; // Decimal
      unitValue = "Decimal";
      derivedLogmar = parseResult.logMARval;
      break;
    }
    case "lettersRead": {
      comp[resultValKey] = `${parseResult.letters} letters read`;
      comp[resultTermKey] = "local";
      comp[resultCodeKey] = "at0152";
      unitCode = "at0167"; // Number of Optotypes
      unitValue = "Number of Optotypes Identified";
      break;
    }
    case "logMARDirect": {
      comp[resultValKey] = parseResult.logmar.toString();
      comp[resultTermKey] = "local";
      comp[resultCodeKey] = "at0152";
      unitCode = "at0165"; // logMAR
      unitValue = "logMAR";
      derivedLogmar = parseResult.logmar;
      break;
    }
    case "nFont": {
      comp[resultValKey] = `N${parseResult.Nvalue}`;
      comp[resultTermKey] = "local";
      comp[resultCodeKey] = "at0152";
      unitCode = "at0281"; // N Font Size
      unitValue = "N Font Size";
      derivedLogmar = parseResult.logmar;
      break;
    }
    case "jaeger": {
      comp[resultValKey] = `${parseResult.Jvalue}J`;
      comp[resultTermKey] = "local";
      comp[resultCodeKey] = "at0152";
      unitCode = "at0170"; // Jaeger J
      unitValue = "Jaeger J";
      derivedLogmar = parseResult.logmar;
      break;
    }
    default:
      // fallback
      comp[resultValKey] = rawValue;
      comp[resultTermKey] = "local";
      comp[resultCodeKey] = "at0152";
      break;
  }

  // Store the Unit of result
  comp[`${prefix}/result_details/unit_of_result|terminology`] = "local";
  comp[`${prefix}/result_details/unit_of_result|code`] = unitCode;
  comp[`${prefix}/result_details/unit_of_result|value`] = unitValue;

  // Derived
  if (derivedLogmar != null && !isNaN(derivedLogmar)) {
    comp[
      `${prefix}/result_details/derived_result/derived_result/coded_text_value|value`
    ] = derivedLogmar.toFixed(2);
    comp[
      `${prefix}/result_details/derived_result/derived_result/coded_text_value|terminology`
    ] = "local";
    comp[
      `${prefix}/result_details/derived_result/derived_result/coded_text_value|code`
    ] = "at0174"; // "HM - Hand movement" is a placeholder code for DV_CODED_TEXT 
                  // Typically you'd use a DV_QUANTITY if truly numeric
    comp[
      `${prefix}/result_details/derived_result/unit_of_derived_result|terminology`
    ] = "local";
    comp[
      `${prefix}/result_details/derived_result/unit_of_derived_result|code`
    ] = "at0185"; // logMAR
    comp[
      `${prefix}/result_details/derived_result/unit_of_derived_result|value`
    ] = "logMAR";
  }
}

export default function VAResultUnitForm() {
  const { control, handleSubmit, watch, setValue } = useForm({
    defaultValues: {
      rightEyeValue: "",
      leftEyeValue: ""
    }
  });

  const [rightParse, setRightParse] = useState(null);
  const [leftParse, setLeftParse] = useState(null);

  const rightVal = watch("rightEyeValue");
  const leftVal = watch("leftEyeValue");

  useEffect(() => {
    setRightParse(parseResultInput(rightVal));
  }, [rightVal]);
  useEffect(() => {
    setLeftParse(parseResultInput(leftVal));
  }, [leftVal]);

  const [finalComposition, setFinalComposition] = useState(null);

  function getSuggestions(value) {
    if (!value) return [];
    const lower = value.toLowerCase();
    return RELEVANT_CODED_DISPLAYS.filter((entry) =>
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
      "test_va_2/category|value": "event",
      "test_va_2/category|terminology": "openehr",
      "test_va_2/category|code": "433"
    };

    // fill right => any_event:0
    fillEyeEvent(0, rightParse, "right", composition, rightVal);
    // fill left => any_event:1
    fillEyeEvent(1, leftParse, "left", composition, leftVal);

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
