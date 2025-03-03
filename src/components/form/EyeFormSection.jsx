import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, Paper, IconButton, Alert } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import VAInput from '../inputs/VAInput';
import MultiPurposeInput from '../inputs/MultiPurposeInput';
import LensSpecificationInput from '../inputs/LensSpecificationInput';
import InterpretationDisplay from '../display/InterpretationDisplay';
import TestParametersDisplay from '../display/TestParametersDisplay';
import { useVisualAcuity } from '../../hooks/useVisualAcuity';

/**
 * Form section for a single eye (right or left)
 */
const EyeFormSection = ({ eye, index, onDataChange }) => {
  const {
    value,
    setValue,
    testParameter,
    setTestParameter,
    corrections,
    setCorrections,
    parsedResult,
    parsedTestParameter,
    testParameters,
    clearTestParameter,
    handleTestParameterEnter,
    vaSuggestions,
    handleSelectSuggestion,
    handleKeyPress,
    formattedData,
    isTestParameterDisabled,
    isValid,
    errorMessage,
    isTestParameterValid,
    testParameterErrorMessage,
    correctionTypes
  } = useVisualAcuity(eye, index);

  // State to track correction validation errors
  const [correctionError, setCorrectionError] = useState(null);

  // Check for invalid correction combinations - such as "None - Uncorrected" with any other correction
  useEffect(() => {
    if (corrections.length > 1) {
      const hasUncorrected = corrections.some(c => c.type === "None - Uncorrected");
      
      if (hasUncorrected) {
        setCorrectionError("'None - Uncorrected' cannot be combined with other corrections.");
      } else {
        setCorrectionError(null);
      }
    } else {
      setCorrectionError(null);
    }
  }, [corrections]);

  // Remove a correction
  const handleRemoveCorrection = (id) => {
    setCorrections(corrections.filter(c => c.id !== id));
  };

  // Update lens specification values
  const handleLensSpecChange = (id, field, value) => {
    const updatedCorrections = corrections.map(c => 
      c.id === id ? { ...c, [field]: value } : c
    );
    setCorrections(updatedCorrections);
  };

  // Pass formatted data to parent component when it changes
  useEffect(() => {
    if (Object.keys(formattedData).length > 0) {
      onDataChange(formattedData);
    }
  }, [formattedData, onDataChange]);

  return (
    <Box sx={{ flex: 1 }}>
      <Typography variant="h6" gutterBottom>
        {eye === 'right' ? 'Right Eye' : 'Left Eye'}
      </Typography>
      
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={7}>
          <VAInput
            value={value}
            onChange={setValue}
            suggestions={vaSuggestions}
            onSelectSuggestion={handleSelectSuggestion}
            onKeyDown={handleKeyPress}
            error={value.length > 0 && !isValid}
            errorMessage={errorMessage}
            label={`${eye === 'right' ? 'Right' : 'Left'} Eye VA`}
            placeholder={eye === 'right' ? 'e.g. 6/6, HM, 0.3dec' : 'e.g. 20/40ft, CF, N8'}
          />
          <InterpretationDisplay 
            parsedResult={parsedResult} 
            parsedTestParameter={parsedTestParameter} 
            testParameters={testParameters}
          />
        </Grid>
        
        <Grid item xs={12} md={5}>
          <MultiPurposeInput
            value={testParameter}
            onChange={setTestParameter}
            suggestions={correctionTypes}
            disabled={isTestParameterDisabled}
            error={testParameter.length > 0 && !isTestParameterValid}
            errorMessage={testParameterErrorMessage}
            label="Testing Parameter"
            placeholder="e.g. 6m, glasses, trial lenses..."
            onEnterPress={handleTestParameterEnter}
          />
          
          {isTestParameterDisabled && parsedResult?.Distance && (
            <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.secondary' }}>
              Distance is already specified in the VA value: {parsedResult.Distance.magnitude}{parsedResult.Distance.unit}
            </Typography>
          )}
          
          {/* Display and allow removal of test parameters */}
          <TestParametersDisplay 
            testParameters={testParameters} 
            onRemove={clearTestParameter} 
          />
        </Grid>
      </Grid>
      
      {/* Display correction validation error */}
      {correctionError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {correctionError}
        </Alert>
      )}
      
      {/* Lens Specifications */}
      {corrections.length > 0 && (
        <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Corrections
          </Typography>
          
          {corrections.map((correction) => (
            <Box 
              key={correction.id} 
              sx={{
                p: 1,
                mb: 1,
                backgroundColor: 'rgba(0, 0, 0, 0.03)',
                borderRadius: 1,
                position: 'relative'
              }}
            >
              <IconButton 
                size="small" 
                sx={{ position: 'absolute', top: 0, right: 0 }}
                onClick={() => handleRemoveCorrection(correction.id)}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
              
              <Typography variant="body2" sx={{ mb: 1 }}>
                {correction.type}
              </Typography>
              
              <LensSpecificationInput 
                correction={correction}
                onChange={(field, value) => handleLensSpecChange(correction.id, field, value)}
              />
            </Box>
          ))}
        </Paper>
      )}
    </Box>
  );
};

export default EyeFormSection;