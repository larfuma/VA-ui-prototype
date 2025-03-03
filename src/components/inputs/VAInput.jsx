import React from 'react';
import { Autocomplete, TextField } from '@mui/material';

/**
 * Visual Acuity input component with autocomplete
 */
const VAInput = ({ 
  value, 
  onChange, 
  suggestions, 
  onSelectSuggestion,
  onKeyDown,
  error,
  errorMessage,
  label,
  placeholder
}) => {
  return (
    <Autocomplete
      freeSolo
      options={suggestions || []}
      inputValue={value}
      onKeyDown={onKeyDown}
      onInputChange={(event, newValue, reason) => {
        if (reason === "selectOption") {
          onSelectSuggestion(newValue);
        } else {
          onChange(newValue);
        }
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label || "Visual Acuity"}
          placeholder={placeholder || 'e.g. 6/6, 0.3dec, HM - Hand movement'}
          error={error}
          helperText={errorMessage}
          fullWidth
        />
      )}
    />
  );
};

export default VAInput;
