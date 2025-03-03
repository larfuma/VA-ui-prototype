import React from 'react';
import { CssBaseline, Container, Typography, Box } from '@mui/material';
import VAForm from './components/form/VAForm';

function App() {
  return (
    <>
      <CssBaseline />
      <Container>
        <Box sx={{ my: 4 }}>
          <VAForm />
        </Box>
      </Container>
    </>
  );
}

export default App;
