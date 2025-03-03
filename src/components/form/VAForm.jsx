import React, { useState } from 'react';
import { Box, Button, Paper, Divider, Typography } from '@mui/material';
import EyeFormSection from './EyeFormSection';
import NotationExamples from '../display/NotationExamples';
import ResultsDisplay from '../display/ResultsDisplay';
import { createComposition } from '../../utils/formatters';

/**
 * Main visual acuity assessment form component
 */
const VAForm = () => {
  const [rightEyeData, setRightEyeData] = useState({});
  const [leftEyeData, setLeftEyeData] = useState({});
  const [composition, setComposition] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Only create composition if we have data for at least one eye
    const hasRightEyeData = Object.keys(rightEyeData).length > 0;
    const hasLeftEyeData = Object.keys(leftEyeData).length > 0;
    
    if (hasRightEyeData || hasLeftEyeData) {
      const newComposition = createComposition(rightEyeData, leftEyeData);
      setComposition(newComposition);
    }
  };

  return (
    <Paper sx={{ p: 3, mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        Experimental openEHR VA Form Prototype
      </Typography>
      
      <NotationExamples />
      
      <form onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, mb: 3 }}>
          {/* Right Eye Section */}
          <EyeFormSection 
            eye="right" 
            index={0} 
            onDataChange={setRightEyeData} 
          />
          
          <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', md: 'block' } }} />
          <Divider sx={{ display: { md: 'none' } }} />
          
          {/* Left Eye Section */}
          <EyeFormSection 
            eye="left" 
            index={1} 
            onDataChange={setLeftEyeData} 
          />
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Button 
            variant="contained" 
            color="primary" 
            type="submit"
            disabled={Object.keys(rightEyeData).length === 0 && Object.keys(leftEyeData).length === 0}
            size="large"
          >
            Generate OpenEHR Composition
          </Button>
        </Box>
      </form>
      
      {/* Display results if available */}
      {composition && <ResultsDisplay data={composition} />}
    </Paper>
  );
};

export default VAForm;
