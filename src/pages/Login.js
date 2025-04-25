import React, { useState, useEffect } from "react";
import { 
  TextField, Button, Typography, Link, Box, Alert, IconButton, 
  InputAdornment, Container, Paper, useTheme, Divider, Fade,
  Grid
} from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { 
  Savings as SavingsIcon, 
  Visibility, 
  VisibilityOff, 
  Login as LoginIcon,
  ArrowBack as ArrowBackIcon
} from "@mui/icons-material";
import CircularProgress from "@mui/material/CircularProgress";
import LoadingScreen from "../components/LoadingScreen";
import { motion } from "framer-motion";
import AOS from 'aos';
import 'aos/dist/aos.css';

// Create motion components
const MotionBox = motion(Box);
const MotionButton = motion(Button);
const MotionPaper = motion(Paper);
const MotionTypography = motion(Typography);

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.2,
      duration: 0.4
    }
  }
};

const itemVariants = {
  hidden: { y: 10, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.3 }
  }
};

const fadeInUpVariant = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { 
      type: "spring", 
      stiffness: 100,
      damping: 10
    }
  }
};

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [postLoginLoading, setPostLoginLoading] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Initialize AOS
  useEffect(() => {
    AOS.init({
      duration: 600,
      easing: 'ease-out',
      once: false
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitted(true);

    // Simple validation
    if (!email || !password) {
      setError("Please fill out all fields");
      return;
    }

    try {
      setError("");
      setLoading(true);
      await login({ email, password });
      setLoading(false);
      
      // Success animation
      setPostLoginLoading(true);
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to log in");
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  if (postLoginLoading) {
    return <LoadingScreen message="Redirecting to Dashboard..." progress={50} />;
  }

  return (
    <MotionBox
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundImage: `linear-gradient(120deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background pattern */}
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: 0.05,
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
      }} />
      
      {/* Header */}
      <MotionBox 
        component="header" 
        variants={itemVariants}
        sx={{ 
          py: 1.5,
          px: 3,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <MotionTypography
          variant="h5"
          component={RouterLink}
          to="/"
          sx={{
            fontWeight: 'bold',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
            '&:hover': {
              opacity: 0.9
            }
          }}
          whileHover={{ scale: 1.05 }}
        >
          <SavingsIcon sx={{ mr: 1, fontSize: 24 }} /> Expense Tracker
        </MotionTypography>
        
        <MotionButton
          component={RouterLink}
          to="/"
          color="inherit"
          variant="outlined"
          size="small"
          startIcon={<ArrowBackIcon />}
          sx={{ 
            color: 'white',
            borderColor: 'rgba(255,255,255,0.5)',
            '&:hover': {
              borderColor: 'white',
              backgroundColor: 'rgba(255,255,255,0.1)'
            }
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Back to Home
        </MotionButton>
      </MotionBox>

      <Container maxWidth="sm" sx={{ 
        display: 'flex', 
        flexGrow: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        py: 2 
      }}>
        <MotionPaper
          variants={fadeInUpVariant}
          elevation={24}
          sx={{ 
            width: '100%',
            p: 3,
            borderRadius: 2,
            backdropFilter: 'blur(10px)',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Decorative bubble animations - simplified for compact layout */}
          <Box sx={{ position: 'absolute', top: 0, right: 0, opacity: 0.1 }}>
            {[...Array(2)].map((_, i) => (
              <Box
                key={i}
                component={motion.div}
                animate={{
                  y: [0, -20, 0],
                  opacity: [0.7, 1, 0.7],
                  scale: [1, 1.1, 1]
                }}
                transition={{
                  duration: 3 + i,
                  repeat: Infinity,
                  repeatType: 'reverse',
                  ease: 'easeInOut',
                  delay: i * 0.8
                }}
                sx={{
                  position: 'absolute',
                  width: 15 + i * 20,
                  height: 15 + i * 20,
                  borderRadius: '50%',
                  background: theme.palette.primary.main,
                  right: 20 - i * 15,
                  top: 10 + i * 10
                }}
              />
            ))}
          </Box>
          
          <Box sx={{ textAlign: 'center', mb: 2, position: 'relative', zIndex: 1 }}>
            <MotionBox
              animate={{ 
                rotate: [0, 5, -5, 5, 0],
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatType: 'reverse',
                ease: 'easeInOut',
                repeatDelay: 3
              }}
              sx={{ mb: 1 }}
            >
              <SavingsIcon color="primary" sx={{ fontSize: 36 }} />
            </MotionBox>
            
            <MotionTypography
              variant="h5"
              component="h1"
              gutterBottom
              variants={itemVariants}
              sx={{ fontWeight: 700, mb: 0.5 }}
            >
              Welcome Back
            </MotionTypography>
            
            <MotionTypography
              variant="body2"
              color="text.secondary"
              variants={itemVariants}
              sx={{ mb: 1 }}
            >
              Sign in to continue to your dashboard
            </MotionTypography>
          </Box>

          <Fade in={!!error} timeout={500}>
            <Box>
              {error && (
                <Alert 
                  severity="error" 
                  sx={{ 
                    mb: 2,
                    borderRadius: 2,
                    py: 0.5,
                    animation: 'pulse 1.5s infinite',
                    '@keyframes pulse': {
                      '0%, 100%': {
                        boxShadow: '0 0 0 0 rgba(211, 47, 47, 0.4)'
                      },
                      '50%': {
                        boxShadow: '0 0 0 8px rgba(211, 47, 47, 0)'
                      }
                    }
                  }}
                >
                  {error}
                </Alert>
              )}
            </Box>
          </Fade>

          <Box 
            component="form" 
            onSubmit={handleSubmit} 
            sx={{ position: 'relative', zIndex: 1 }}
            data-aos="fade-up"
            data-aos-delay="100"
          >
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  variant="outlined"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={formSubmitted && !email}
                  helperText={formSubmitted && !email ? "Email is required" : ""}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&.Mui-focused fieldset': {
                        borderWidth: 2,
                      },
                      '&:hover fieldset': {
                        borderColor: theme.palette.primary.main,
                      },
                    },
                  }}
                  InputProps={{
                    sx: { borderRadius: 1.5 }
                  }}
                  size="small"
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  variant="outlined"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  id="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={formSubmitted && !password}
                  helperText={formSubmitted && !password ? "Password is required" : ""}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={togglePasswordVisibility}
                          edge="end"
                          sx={{ 
                            color: theme.palette.text.secondary,
                            transition: 'transform 0.2s',
                            '&:hover': { transform: 'scale(1.1)' }
                          }}
                          size="small"
                        >
                          {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                    sx: { borderRadius: 1.5 }
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&.Mui-focused fieldset': {
                        borderWidth: 2,
                      },
                      '&:hover fieldset': {
                        borderColor: theme.palette.primary.main,
                      },
                    },
                  }}
                  size="small"
                />
              </Grid>
            </Grid>
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 0.5, mb: 1 }}>
              <Link 
                component={RouterLink} 
                to="/forgot-password" 
                variant="body2"
                color="primary"
                sx={{ 
                  textDecoration: 'none',
                  fontWeight: 500,
                  fontSize: '0.8rem',
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                Forgot password?
              </Link>
            </Box>

            <MotionButton
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              size="medium"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <LoginIcon />}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              sx={{ 
                mt: 1, 
                mb: 2,
                py: 1,
                fontWeight: 600,
                letterSpacing: 0.5,
                borderRadius: 2,
                boxShadow: 2,
                position: 'relative',
                overflow: 'hidden',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: '-100%',
                  width: '200%',
                  height: '100%',
                  background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)`,
                  animation: 'ripple 2s infinite'
                },
                '@keyframes ripple': {
                  '0%': { left: '-100%' },
                  '100%': { left: '100%' }
                }
              }}
            >
              {loading ? "Signing In..." : "Sign In"}
            </MotionButton>

            <Divider sx={{ my: 1.5 }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                OR
              </Typography>
            </Divider>

            <Typography variant="body2" align="center" data-aos="fade-up">
              Don't have an account?{" "}
              <Link 
                component={RouterLink} 
                to="/register" 
                variant="body2"
                color="primary"
                sx={{ 
                  fontWeight: 600,
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                Sign Up
              </Link>
            </Typography>
          </Box>
        </MotionPaper>
      </Container>
    </MotionBox>
  );
};

export default Login;