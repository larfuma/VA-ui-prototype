import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

/**
 * Component to display the final OpenEHR formatted results
 */
const ResultsDisplay = ({ data }) => {
  if (!data || Object.keys(data).length === 0) {
    return null;
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        OpenEHR Composition
      </Typography>
      
      
      <Paper 
        elevation={2} 
        sx={{ 
          p: 2, 
          maxHeight: '400px', 
          overflow: 'auto',
          backgroundColor: '#f8f9fa',
          fontFamily: 'monospace'
        }}
      >
        <pre style={{ margin: 0, overflow: 'auto' }}>
          {JSON.stringify(data, null, 2)}
        </pre>
      </Paper>
      
      <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic' }}>
        experimental! 
      </Typography>
    </Box>
  );
};

export default ResultsDisplay;
