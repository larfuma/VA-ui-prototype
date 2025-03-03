import React, { useState } from 'react';
import { Autocomplete, TextField } from '@mui/material';

/**
 * Multi-purpose input for distance or correction types
 */
const MultiPurposeInput = ({ 
  value, 
  onChange, 
  suggestions, 
  disabled,
  error,
  errorMessage,
  label,
  placeholder,
  onEnterPress
}) => {
  const [inputValue, setInputValue] = useState('');

  const handleInputChange = (event, newValue, reason) => {
    setInputValue(newValue);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && inputValue) {
      // Only on Enter key, apply the value
      onChange(inputValue);
      
      // Also call the onEnterPress callback if provided
      if (onEnterPress) {
        onEnterPress(inputValue);
      }
    }
  };

  const handleOptionSelect = (event, selectedValue) => {
    if (selectedValue) {
      // When selecting from dropdown, apply immediately
      onChange(selectedValue);
    }
  };

  return (
    <Autocomplete
      freeSolo
      options={suggestions || []}
      inputValue={inputValue}
      value={value}
      disabled={disabled}
      onInputChange={handleInputChange}
      onChange={handleOptionSelect}
      onKeyDown={handleKeyDown}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label || "Testing Parameter"}
          placeholder={placeholder || 'e.g. 6m, glasses, trial lenses...'}
          error={error}
          helperText={errorMessage}
          fullWidth
        />
      )}
    />
  );
};

export default MultiPurposeInput;