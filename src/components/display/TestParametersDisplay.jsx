import React from 'react';
import { Box, Chip, Typography } from '@mui/material';

/**
 * Component to display recorded test parameters with option to remove them
 */
const TestParametersDisplay = ({ testParameters, onRemove }) => {
  // If no parameters are set, don't show anything
  const hasParameters = Object.values(testParameters).some(value => value !== null);
  
  if (!hasParameters) {
    return null;
  }
  
  return (
    <Box sx={{ mt: 2, mb: 1 }}>
      <Typography variant="subtitle2" gutterBottom>
        Testing Parameters
      </Typography>
      
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {testParameters.distance && (
          <Chip 
            label={`Distance: ${testParameters.distance.magnitude}${testParameters.distance.unit} (${testParameters.distance.source})`}
            onDelete={() => onRemove('distance')}
            size="small"
            color="default"
            variant="outlined"
          />
        )}
        
        {testParameters.chartType && (
          <Chip 
            label={`Chart: ${testParameters.chartType}`}
            onDelete={() => onRemove('chartType')}
            size="small"
            color="primary"
            variant="outlined"
          />
        )}
        
        {testParameters.method && (
          <Chip 
            label={`Method: ${testParameters.method}`}
            onDelete={() => onRemove('method')}
            size="small"
            color="secondary"
            variant="outlined"
          />
        )}
        
        {testParameters.optotype && (
          <Chip 
            label={`Optotype: ${testParameters.optotype}`}
            onDelete={() => onRemove('optotype')}
            size="small"
            color="info"
            variant="outlined"
          />
        )}
      </Box>
    </Box>
  );
};

export default TestParametersDisplay;