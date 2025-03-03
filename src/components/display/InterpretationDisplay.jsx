import React from 'react';
import { Typography, Box } from '@mui/material';

/**
 * Component to display visual acuity interpretation
 */
const InterpretationDisplay = ({ parsedResult, parsedTestParameter, testParameters }) => {
  // If no valid parsed results, don't display anything
  if (!parsedResult?.valid && (!parsedTestParameter || !parsedTestParameter.valid)) {
    return null;
  }

  // Display VA result interpretation if available
  if (parsedResult?.valid) {
    let additionalText = "";
    
    // We don't need to show distance info here since it will be in the chips

    let interpretationText = "";

    switch (parsedResult.type) {
      case "coded-official":
        interpretationText = `Coded: ${parsedResult.label} (${parsedResult.codeSystem} ${parsedResult.codeString})`;
        break;
        
      case "nFont":
        interpretationText = `N-Font: N${parsedResult.Nvalue}`;
        break;
        
      case "jaeger":
        interpretationText = `Jaeger: ${parsedResult.Jvalue}J`;
        break;
        
      case "Meter Snellen Ratio":
        interpretationText = `Meter Snellen Ratio: ${parsedResult.numerator}/${parsedResult.denominator}`;
        break;
        
      case "Feet Snellen Ratio":
        interpretationText = `Feet Snellen Ratio: ${parsedResult.numerator}/${parsedResult.denominator}`;
        break;
        
      case "lettersRead":
        interpretationText = `Letters read: ${parsedResult.letters}`;
        break;
        
      case "decimal":
        interpretationText = `Decimal VA: ${parsedResult.decimalValue}`;
        break;
        
      case "logMARDirect":
        interpretationText = `logMAR: ${parsedResult.logmar}`;
        break;
        
      default:
        interpretationText = null;
    }

    if (interpretationText) {
      return (
        <Box sx={{ mt: 1 }}>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {interpretationText} {additionalText}
          </Typography>
        </Box>
      );
    }
  }
  
  // Test parameter interpretation when there's no VA result
  else if (parsedTestParameter?.valid) {
    let parameterText = "";
    
    switch (parsedTestParameter.type) {
      case "distance":
        parameterText = `Distance: ${parsedTestParameter.magnitude}${parsedTestParameter.unit}`;
        break;
        
      case "correction":
        parameterText = `Correction: ${parsedTestParameter.value}`;
        break;
        
      case "chartType":
        parameterText = `Chart Type: ${parsedTestParameter.value}`;
        break;
        
      case "method":
        parameterText = `Testing Method: ${parsedTestParameter.value}`;
        break;
        
      case "optotype":
        parameterText = `Optotype: ${parsedTestParameter.value}`;
        break;
        
      default:
        parameterText = null;
    }
    
    if (parameterText) {
      return (
        <Box sx={{ mt: 1 }}>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {parameterText}
          </Typography>
        </Box>
      );
    }
  }
  
  return null;
};

export default InterpretationDisplay;