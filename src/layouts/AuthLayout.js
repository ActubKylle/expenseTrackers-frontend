import React from 'react';
import { Container, Paper, Typography, Box } from '@mui/material';

const AuthLayout = ({ children, title }) => {
  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Typography component="h1" variant="h5">
            {title}
          </Typography>
          {children}
        </Paper>
      </Box>
    </Container>
  );
};

export default AuthLayout;