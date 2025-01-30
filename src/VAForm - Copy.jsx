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
 * 1) UNIT references (not using atXXXX for display).
 *   We'll keep 5 units:
 *   - Meter Snellen (fraction)
 *   - Feet Snellen (fraction)
 *   - logMAR (default numeric)
 *   - Decimal (if ends with "dec")
 *   - Letters read (if integer > 3)
 */
const UNIT_CODES = {
  meterSnellen: { code: "M-Snellen", label: "Meter Snellen Ratio" },
  feetSnellen: { code: "Ft-Snellen", label: "Feet Snellen Ratio" },
  logMAR: { code: "logMAR", label: "logMAR" },
  decimal: { code: "Decimal", label: "Decimal" },
  lettersRead: { code: "Letters", label: "Number of Letters Read" }
};

/**
 * 2) Coded dictionary => SNOMED codes + logMAR approximation
 *    HM => 1.9, CF => 1.8, rest have no logMAR
 */
const CODED_RESULTS_DICT = {
  "HM - Hand movement": {
    snomed: "260295004",
    hasLogmar: true,
    logmar: 2.3
  },
  "CF - Count fingers": {
    snomed: "260295003", // example placeholder
    hasLogmar: true,
    logmar: 1.9
  },
  "LP - Light Perception": {
    snomed: "260296003",
    hasLogmar: false
  },
  "LPAP - Light Perception, accurate Projection": {
    snomed: "260297007",
    hasLogmar: false
  },
  "LPIP - Light Perception, inaccurate Projection": {
    snomed: "260298002",
    hasLogmar: false
  },
  "NLP - No Light Perception": {
    snomed: "63063006",
    hasLogmar: false
  }
};

const CODED_RESULTS_ARRAY = Object.keys(CODED_RESULTS_DICT);

/**
 * numeric helpers
 */
function decimalToLogmar(dec) {
  if (dec <= 0) return NaN;
  return -Math.log10(dec);
}
function logmarToDecimal(lm) {
  return Math.pow(10, -lm);
}

/**
 * parseResultInput(inputRaw):
 *
 * Steps:
 *   A) EXACT coded match => return coded
 *   B) fraction => snellen ratio (6/6 => meter, 20/40 => feet, or forced suffix 'm'/'ft')
 *   C) numeric:
 *       - check suffix "dec"
 *         => parse numeric portion => interpret as decimal
 *         => compute logMAR
 *       - else if integer>3 => letters read
 *       - else => logMAR by default
 */
function parseResultInput(inputRaw) {
  if (!inputRaw) {
    return { valid: false, error: "Empty input" };
  }
  let input = inputRaw.trim();

  // A) EXACT coded match
  const codedEntry = CODED_RESULTS_ARRAY.find(
    (k) => k.toLowerCase() === input.toLowerCase()
  );
  if (codedEntry) {
    const entryObj = CODED_RESULTS_DICT[codedEntry];
    if (entryObj.hasLogmar) {
      return {
        valid: true,
        type: "coded",
        label: codedEntry,
        snomed: entryObj.snomed,
        codedLogmar: entryObj.logmar,
        codedDecimal: logmarToDecimal(entryObj.logmar)
      };
    }
    // no logMAR
    return {
      valid: true,
      type: "coded",
      label: codedEntry,
      snomed: entryObj.snomed,
      codedLogmar: null
    };
  }

  // Possibly forced distance suffix for fractions:
  let forcedDistance = null;
  if (input.toLowerCase().endsWith("m")) {
    forcedDistance = "meters";
    input = input.slice(0, -1).trim();
  } else if (input.toLowerCase().endsWith("ft")) {
    forcedDistance = "feet";
    input = input.slice(0, -2).trim();
  }

  // B) fraction => x/y
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

    // Decide meter vs feet
    let finalUnit = UNIT_CODES.meterSnellen;
    if (forcedDistance === "feet") finalUnit = UNIT_CODES.feetSnellen;
    else if (forcedDistance === "meters") finalUnit = UNIT_CODES.meterSnellen;
    else {
      // if numerator=20 => feet, if 6 => meter, else meter
      if (numerator === 20) finalUnit = UNIT_CODES.feetSnellen;
      else if (numerator === 6) finalUnit = UNIT_CODES.meterSnellen;
    }

    const decimalVA = numerator / denominator;
    const logMARval = decimalToLogmar(decimalVA);

    return {
      valid: true,
      type: "fraction",
      numerator,
      denominator,
      unit: finalUnit,
      decimalVA,
      logMARval
    };
  } else if (slashCount > 1) {
    return { valid: false, error: "Too many slashes" };
  }

  // C) numeric
  // Check if ends with "dec"
  let endsWithDec = false;
  if (input.toLowerCase().endsWith("dec")) {
    endsWithDec = true;
    input = input.slice(0, -3).trim();
  }

  // Must be digits, dot, comma
  if (!/^[0-9.,]+$/.test(input)) {
    return { valid: false, error: "Invalid characters for numeric input" };
  }
  const numericVal = parseFloat(input.replace(",", "."));
  if (isNaN(numericVal)) {
    return { valid: false, error: "Cannot parse numeric" };
  }

  // integer>3 => letters read
  if (Number.isInteger(numericVal) && numericVal > 3) {
    return {
      valid: true,
      type: "lettersRead",
      letters: numericVal,
      unit: UNIT_CODES.lettersRead
    };
  }

  if (endsWithDec) {
    // interpret as decimal
    const logmar = decimalToLogmar(numericVal);
    return {
      valid: true,
      type: "decimal",
      decimalValue: numericVal,
      logMARval: logmar,
      unit: UNIT_CODES.decimal
    };
  }

  // else => default is logMAR
  const decVal = logmarToDecimal(numericVal);
  return {
    valid: true,
    type: "logMARDirect",
    logmar: numericVal,
    decimalVA: decVal,
    unit: UNIT_CODES.logMAR
  };
}

export default function VAResultUnitForm() {
  const { control, handleSubmit, watch, setValue } = useForm({
    defaultValues: { resultValue: "" }
  });
  const [parsed, setParsed] = useState(null);
  const userInput = watch("resultValue");

  // Re-parse on input change
  useEffect(() => {
    const res = parseResultInput(userInput);
    setParsed(res);
  }, [userInput]);

  // Build suggestions if user typed letters
  const getSuggestions = () => {
    if (!userInput) return [];
    const hasLetters = /[a-zA-Z]/.test(userInput);
    if (hasLetters) {
      const lower = userInput.toLowerCase();
      return CODED_RESULTS_ARRAY.filter((item) =>
        item.toLowerCase().includes(lower)
      );
    }
    return [];
  };
  const suggestions = getSuggestions();

  const onSubmit = (data) => {
    if (!parsed || !parsed.valid) {
      alert(`Invalid: ${parsed?.error || "Unknown error"}`);
      return;
    }
    console.log("Raw data:", data);
    console.log("Parsed result:", parsed);
    alert("Check console!");
  };

  // On <Enter>, if exactly 1 suggestion => auto-select
  const handleEnterIfSingleSuggestion = (evt) => {
    if (evt.key === "Enter" && suggestions.length === 1) {
      evt.preventDefault();
      setValue("resultValue", suggestions[0]);
    }
  };

  // Renders final interpretation below
  const renderInterpretation = () => {
    if (!parsed) return null;
    if (!parsed.valid) {
      return <Typography color="error">Invalid: {parsed.error}</Typography>;
    }
    switch (parsed.type) {
      case "coded":
        return (
          <Box>
            <Typography>
              <strong>Coded:</strong> {parsed.label}
            </Typography>
            <Typography>SNOMED: {parsed.snomed}</Typography>
            {parsed.codedLogmar != null && (
              <Typography>
                logMAR≈ {parsed.codedLogmar.toFixed(2)}, decimal≈{" "}
                {parsed.codedDecimal?.toFixed(4)}
              </Typography>
            )}
          </Box>
        );

      case "fraction":
        return (
          <Box>
            <Typography>
              <strong>Fraction:</strong> {parsed.numerator}/{parsed.denominator}
            </Typography>
            <Typography>
              <strong>Unit:</strong> {parsed.unit.label} ({parsed.unit.code})
            </Typography>
            <Typography>
              Decimal VA={parsed.decimalVA.toFixed(3)}, logMAR=
              {isNaN(parsed.logMARval)
                ? "N/A"
                : parsed.logMARval.toFixed(2)}
            </Typography>
          </Box>
        );

      case "lettersRead":
        return (
          <Box>
            <Typography>
              <strong>Letters Read:</strong> {parsed.letters}
            </Typography>
          </Box>
        );

      case "decimal":
        return (
          <Box>
            <Typography>
              <strong>Decimal:</strong> {parsed.decimalValue}
            </Typography>
            <Typography>
              <strong>logMAR:</strong>{" "}
              {isNaN(parsed.logMARval)
                ? "N/A"
                : parsed.logMARval.toFixed(2)}
            </Typography>
          </Box>
        );

      case "logMARDirect":
        return (
          <Box>
            <Typography>
              <strong>logMAR:</strong> {parsed.logmar}
            </Typography>
            <Typography>
              <strong>Decimal:</strong>{" "}
              {isNaN(parsed.decimalVA)
                ? "N/A"
                : parsed.decimalVA.toFixed(4)}
            </Typography>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Paper sx={{ p: 3, m: 2 }}>
      <Typography variant="h5" gutterBottom>
        Visual Acuity Entry (logMAR Default)
      </Typography>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Box sx={{ mb: 2 }}>
          <Controller
            name="resultValue"
            control={control}
            render={({ field: { onChange, onBlur, value } }) => {
              const isInvalid = parsed && !parsed.valid && value.length > 0;
              return (
                <Autocomplete
                  freeSolo
                  options={suggestions}
                  inputValue={value}
                  onKeyDown={handleEnterIfSingleSuggestion}
                  onInputChange={(_e, newVal, reason) => {
                    if (reason === "selectOption") {
                      onChange(newVal);
                    } else {
                      onChange(newVal);
                    }
                  }}
                  renderOption={(props, option) => {
                    const cinfo = CODED_RESULTS_DICT[option];
                    return (
                      <li {...props} key={option}>
                        {option} — SNOMED: {cinfo.snomed}
                      </li>
                    );
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      onBlur={onBlur}
                      label="Result"
                      placeholder='Examples: "6/6", "20/40ft", "4" (letters read), "1.2dec", "HM - Hand movement"'
                      error={isInvalid}
                      helperText={isInvalid ? parsed?.error : ""}
                    />
                  )}
                />
              );
            }}
          />
        </Box>

        <Button variant="contained" type="submit">
          Save
        </Button>
      </form>

      <Box sx={{ mt: 3 }}>{renderInterpretation()}</Box>
    </Paper>
  );
}
