import React from 'react';
import { Grid, TextField, Typography } from '@mui/material';
import { parseDiopterValue } from '../../utils/parsers';

/**
 * Lens specification input component
 * Handles sphere, cylinder, and axis inputs with special parsing
 */
const LensSpecificationInput = ({ correction, onChange }) => {
  // If correction type doesn't require lens specification, return null
  if (correction.requiresLensSpecification === false) {
    return null;
  }
  
  const handleChange = (field, value) => {
    onChange(field, value);
  };
  
  // Format diopter display value for sphere and cylinder
  const getHelperText = (value, isDiopter = true) => {
    if (!value) return '';
    
    if (isDiopter) {
      const parsed = parseDiopterValue(value);
      if (parsed.valid) {
        return `Parsed as: ${parsed.value} diopters`;
      }
      return parsed.error || '';
    }
    
    return '';
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={4}>
        <TextField
          fullWidth
          label="Sphere"
          variant="outlined"
          size="small"
          value={correction.sphere}
          onChange={(e) => handleChange('sphere', e.target.value)}
          placeholder="e.g. +1.25, -2, 1q"
          helperText={getHelperText(correction.sphere)}
        />
      </Grid>
      
      <Grid item xs={4}>
        <TextField
          fullWidth
          label="Cylinder"
          variant="outlined"
          size="small"
          value={correction.cylinder}
          onChange={(e) => handleChange('cylinder', e.target.value)}
          placeholder="e.g. -0.5, 1h, 0"
          helperText={getHelperText(correction.cylinder)}
        />
      </Grid>
      
      <Grid item xs={4}>
        <TextField
          fullWidth
          label="Axis"
          variant="outlined"
          size="small"
          value={correction.axis}
          onChange={(e) => handleChange('axis', e.target.value)}
          placeholder="e.g. 90, 180, 45"
          helperText={getHelperText(correction.axis, false)}
        />
      </Grid>
    </Grid>
  );
};

export default LensSpecificationInput;