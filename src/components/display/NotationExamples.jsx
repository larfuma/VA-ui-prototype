import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { NOTATION_EXAMPLES } from '../../constants/notationMaps';

/**
 * Component to display examples of different notation formats
 */
const NotationExamples = () => {
  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Supported Notation Formats
      </Typography>
      
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        {NOTATION_EXAMPLES.map((example, index) => (
          <Box key={index} sx={{ minWidth: '200px', flex: '1 1 auto' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {example.label}
            </Typography>
            <Typography variant="body2">
              Example: <code>{example.example}</code>
            </Typography>
          </Box>
        ))}
      </Box>
      
      <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic' }}>
        Note: The system automatically detects the notation format and applies appropriate default testing distances.
      </Typography>
    </Paper>
  );
};

export default NotationExamples;
