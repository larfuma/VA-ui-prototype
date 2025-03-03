import React from 'react';
import { TextField } from '@mui/material';

/**
 * Testing distance input component
 */
const DistanceInput = ({ 
  value, 
  onChange, 
  disabled,
  error,
  errorMessage,
  label,
  placeholder
}) => {
  return (
    <TextField
      value={value}
      onChange={(e) => onChange(e.target.value)}
      label={label || "Testing Distance"}
      placeholder={placeholder || 'e.g. 6m, 35cm, 20ft'}
      error={error}
      helperText={errorMessage}
      disabled={disabled}
      fullWidth
    />
  );
};

export default DistanceInput;
