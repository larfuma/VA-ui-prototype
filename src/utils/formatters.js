import { EYE_CODES } from '../constants/units';
import { parseDiopterValue } from './parsers';
import { 
  CORRECTION_TYPES, 
  QUALITATIVE_MEASURES, 
  CHART_TYPES, 
  TESTING_METHODS,
  OPTOTYPE_TYPES
} from '../constants/correctionTypes';

/**
 * Fill in OpenEHR event data for a single eye
 * @param {number} index - Index of the event (0 for right eye, 1 for left eye)
 * @param {Object} parseResult - Parsed visual acuity result
 * @param {string} eye - 'right' or 'left'
 * @param {Object} [distanceResult] - Parsed distance result (if separately provided)
 * @param {string} rawValue - Original input string
 * @param {Array} [corrections] - Array of correction objects with lens specifications
 * @param {Object} [testParameters] - Other test parameters (chart type, method, etc)
 * @returns {Object} - OpenEHR formatted data object
 */
export function formatEyeEvent(index, parseResult, eye, distanceResult, rawValue, corrections = [], testParameters = {}) {
  if (!parseResult?.valid) return {};

  const result = {};
  
  // Dynamically generate the prefix based on the index
  const prefix = `va_test_template/visual_acuity_test_result:${index}`;

  // Eye code
  const eyeData = EYE_CODES[eye];
  result[`${prefix}/eye_s_examined|value`] = eyeData.text;
  result[`${prefix}/eye_s_examined|terminology`] = "local";
  result[`${prefix}/eye_s_examined|code`] = eyeData.code;

  // Testing distance - use distance from testParameters if available
  if (testParameters.distance) {
    result[`${prefix}/testing_distance/quantity_value|unit`] = testParameters.distance.unit;
    result[`${prefix}/testing_distance/quantity_value|magnitude`] = testParameters.distance.magnitude;
  } else {
    // Fallback to original logic
    const finalDistance = distanceResult?.valid 
      ? distanceResult 
      : parseResult.Distance;
      
    result[`${prefix}/testing_distance/quantity_value|unit`] = finalDistance.unit;
    result[`${prefix}/testing_distance/quantity_value|magnitude`] = finalDistance.magnitude;
  }

  // Result details based on type of input
  switch (parseResult.type) {
    case "coded-official":
      // Find the matching qualitative measure from our constants
      const matchingQualitative = QUALITATIVE_MEASURES.find(item => 
        item.value === parseResult.label
      );
      
      if (matchingQualitative) {
        result[`${prefix}/result_details/qualitative_measures|value`] = matchingQualitative.value;
        result[`${prefix}/result_details/qualitative_measures|terminology`] = matchingQualitative.snomed.startsWith("LA") ? "LOINC" : "SNOMED-CT";
        result[`${prefix}/result_details/qualitative_measures|code`] = matchingQualitative.code;
      } else {
        result[`${prefix}/result_details/qualitative_measures|value`] = parseResult.label;
        result[`${prefix}/result_details/qualitative_measures|terminology`] = parseResult.codeSystem;
        result[`${prefix}/result_details/qualitative_measures|code`] = parseResult.codeString;
      }
      break;
      
    case "Meter Snellen Ratio":
      result[`${prefix}/result_details/meter_snellen_ratio|numerator`] = parseResult.numerator;
      result[`${prefix}/result_details/meter_snellen_ratio|denominator`] = parseResult.denominator;
      result[`${prefix}/result_details/meter_snellen_ratio|type`] = 0;
      result[`${prefix}/result_details/meter_snellen_ratio`] = parseResult.decimalVA;
      break;
      
    case "Feet Snellen Ratio":
      result[`${prefix}/result_details/feet_snellen_ratio|numerator`] = parseResult.numerator;
      result[`${prefix}/result_details/feet_snellen_ratio|denominator`] = parseResult.denominator;
      result[`${prefix}/result_details/feet_snellen_ratio|type`] = 0;
      result[`${prefix}/result_details/feet_snellen_ratio`] = parseResult.decimalVA;
      break;
      
    case "decimal":
      result[`${prefix}/result_details/decimal_notation|magnitude`] = parseResult.decimalValue;
      break;
      
    case "lettersRead":
      result[`${prefix}/result_details/number_of_recognized_optotypes|magnitude`] = parseResult.letters;
      break;
      
    case "logMARDirect":
      result[`${prefix}/result_details/logmar|magnitude`] = parseResult.logmar;
      break;
      
    case "nFont":
      result[`${prefix}/result_details/n_font_size_notation|magnitude`] = parseResult.Nvalue;
      break;
      
    case "jaeger":
      result[`${prefix}/result_details/jaeger_font_size_notation|magnitude`] = parseResult.Jvalue;
      break;
      
    default:
      result[`${prefix}/result_details/qualitative_measures|value`] = rawValue;
      break;
  }

  // Add correction data if present
  if (corrections && corrections.length > 0) {
    corrections.forEach((correction, corrIndex) => {
      // Find the corresponding correction type from our constants
      const correctionType = CORRECTION_TYPES.find(ct => ct.value === correction.type);
      
      if (!correctionType) return;
      
      // For left eye, we need to use a different set of codes (at0338-at0350)
      // For right eye, we use the original codes (at0264-at0276)
      let correctionCode = correctionType.code;
      
      // Adjust the code if this is for the left eye (add 74 to get from at0264 to at0338)
      if (eye === 'left') {
        const codeNum = parseInt(correctionCode.substring(2), 10);
        correctionCode = `at0${codeNum + 74}`;
      }
      
      // Always use index for second and subsequent corrections
      const positionPrefix = `${prefix}/position_in_front_of_${eye}_eye${corrIndex > 0 ? ':' + corrIndex : ''}`;
      
      // Add correction type with proper code
      result[`${positionPrefix}/type_of_correction|value`] = correctionType.value;
      result[`${positionPrefix}/type_of_correction|terminology`] = "local";
      result[`${positionPrefix}/type_of_correction|code`] = correctionCode;
      
      // Add lens specification if available
      if (correction.sphere || correction.cylinder || correction.axis) {
        const lensPrefix = `${positionPrefix}/lens_specification`;
        
        // Add sphere power if provided
        if (correction.sphere) {
          const sphereParsed = parseDiopterValue(correction.sphere);
          if (sphereParsed.valid) {
            result[`${lensPrefix}/sphere_power|magnitude`] = sphereParsed.value;
            result[`${lensPrefix}/sphere_power|unit`] = "[diop]";
          }
        }
        
        // Add cylinder power if provided
        if (correction.cylinder) {
          const cylinderParsed = parseDiopterValue(correction.cylinder);
          if (cylinderParsed.valid) {
            result[`${lensPrefix}/cylinder_power|magnitude`] = cylinderParsed.value;
            result[`${lensPrefix}/cylinder_power|unit`] = "[diop]";
          }
        }
        
        // Add axis if provided 
        if (correction.axis) {
          const axisValue = parseFloat(correction.axis);
          if (!isNaN(axisValue)) {
            result[`${lensPrefix}/cylinder_axis|magnitude`] = axisValue;
            result[`${lensPrefix}/cylinder_axis|unit`] = "deg";
          }
        }
      }
    });
  }

  // Add other test parameters (chart type, method, optotype)
  if (testParameters.chartType) {
    const chartType = CHART_TYPES.find(item => item.value === testParameters.chartType);
    if (chartType) {
      result[`${prefix}/chart_card_type|value`] = chartType.value;
      result[`${prefix}/chart_card_type|code`] = chartType.code;
      result[`${prefix}/chart_card_type|terminology`] = "local";
    }
  }

  if (testParameters.method) {
    const method = TESTING_METHODS.find(item => item.value === testParameters.method);
    if (method) {
      result[`${prefix}/general_method|value`] = method.value;
      result[`${prefix}/general_method|code`] = method.code;
      result[`${prefix}/general_method|terminology`] = "local";
    }
  }

  if (testParameters.optotype) {
    const optotype = OPTOTYPE_TYPES.find(item => item.value === testParameters.optotype);
    if (optotype) {
      result[`${prefix}/optotype|value`] = optotype.value;
      result[`${prefix}/optotype|code`] = optotype.code;
      result[`${prefix}/optotype|terminology`] = "local";
    }
  }

  return result;
}

/**
 * Create a complete OpenEHR composition for visual acuity test
 * @param {Object} rightEyeData - Formatted data for right eye
 * @param {Object} leftEyeData - Formatted data for left eye
 * @returns {Object} - Complete OpenEHR composition
 */
export function createComposition(rightEyeData, leftEyeData) {
  // Create base composition object with metadata
  const composition = {
    "va_test_template/category|terminology": "openehr",
    "va_test_template/category|code": "433",
    "va_test_template/category|value": "event",
    "va_test_template/context/start_time": new Date().toISOString(),
    "va_test_template/context/setting|terminology": "openehr",
    "va_test_template/context/setting|value": "home",
    "va_test_template/context/setting|code": "225",
    "va_test_template/context/_end_time": new Date().toISOString(),
    "va_test_template/context/_health_care_facility|name": "DOE, John",
    "va_test_template/language|code": "en",
    "va_test_template/language|terminology": "ISO_639-1",
    "va_test_template/territory|terminology": "ISO_3166-1",
    "va_test_template/territory|code": "US",
    "va_test_template/composer|name": "Visual Acuity Assessment App"
  };
  
  // Merge in eye data
  return {
    ...composition,
    ...rightEyeData,
    ...leftEyeData
  };
}