import React, { useState, useEffect } from "react";
import { 
  TextField, Button, Typography, Link, Box, Alert, IconButton, 
  InputAdornment, Container, Paper, useTheme, Divider, Fade,
  Grid, Dialog, DialogContent, DialogTitle, DialogActions, Zoom
} from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { 
  Savings as SavingsIcon, 
  Visibility, 
  VisibilityOff, 
  PersonAdd as PersonAddIcon,
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon
} from "@mui/icons-material";
import CircularProgress from "@mui/material/CircularProgress";
import { motion } from "framer-motion";

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

// Transition for modal
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Zoom ref={ref} {...props} />;
});

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    
    if (!firstName.trim()) {
      newErrors.firstName = "First name is required";
    }
    
    if (!lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }
    
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid";
    }
    
    // Trim passwords before validation to avoid whitespace issues
    const trimmedPassword = password.trim();
    const trimmedConfirmPassword = confirmPassword.trim();
    
    if (!trimmedPassword) {
      newErrors.password = "Password is required";
    } else if (trimmedPassword.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }
    
    if (trimmedPassword !== trimmedConfirmPassword) {
      newErrors.confirmPassword = "Passwords don't match";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      try {
        setLoading(true);
        // Create name field instead of fullName to match API expectations
        const name = `${firstName} ${lastName}`.trim();
        // Trim password before submission
        const trimmedPassword = password.trim();
        // Add password_confirmation field to match Laravel's validation requirement
        await register({ 
          name, 
          email, 
          password: trimmedPassword,
          password_confirmation: trimmedPassword 
        });
        
        // Success state
        setSuccess(true);
        setShowSuccessModal(true);
        
        // Redirect to dashboard after brief delay
        setTimeout(() => {
          setShowSuccessModal(false);
          navigate("/dashboard");
        }, 2000);
      } catch (err) {
        setErrors({
          ...errors,
          general: err.response?.data?.message || "Failed to register"
        });
        setLoading(false);
      }
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword((prev) => !prev);
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    navigate("/dashboard");
  };

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
        // overflow: 'hidden'
      }}
    >
      {/* Success Modal */}
      <Dialog
        open={showSuccessModal}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleCloseSuccessModal}
        aria-describedby="success-modal"
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: 24,
            maxWidth: 400,
            mx: 2
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          backgroundColor: theme.palette.success.main, 
          color: 'white',
          py: 1.5
        }}>
          <CheckCircleIcon sx={{ mr: 1 }} />
          Registration Successful
          <IconButton
            aria-label="close"
            onClick={handleCloseSuccessModal}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: 'white'
            }}
            size="small"
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ mt: 2, pt: 1 }}>
          <Typography variant="body1" gutterBottom>
            Your account has been created successfully!
          </Typography>
          <Typography variant="body2" color="text.secondary">
            You are now being redirected to the dashboard.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
            <CircularProgress size={30} color="success" />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={handleCloseSuccessModal} 
            variant="contained" 
            color="success"
            fullWidth
            sx={{ 
              borderRadius: 1.5, 
              py: 1,
              fontWeight: 600
            }}
          >
            Go to Dashboard
          </Button>
        </DialogActions>
      </Dialog>

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
            overflow: 'hidden',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Decorative bubble animations */}
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
              Create an Account
            </MotionTypography>
            
            <MotionTypography
              variant="body2"
              color="text.secondary"
              variants={itemVariants}
              sx={{ mb: 1 }}
            >
              Join us to track and manage your expenses
            </MotionTypography>
          </Box>

          <Fade in={!!errors.general} timeout={500}>
            <Box sx={{ mb: 2 }}>
              {errors.general && (
                <Alert 
                  severity="error" 
                  sx={{ 
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
                  {errors.general}
                </Alert>
              )}
            </Box>
          </Fade>

          <Box 
            component="form" 
            onSubmit={handleSubmit} 
            sx={{ 
              position: 'relative', 
              zIndex: 1, 
              overflow: 'auto', 
              flexGrow: 1,
              display: 'flex',
              flexDirection: 'column' 
            }}
          >
            <Box sx={{ flexGrow: 1,  pr: 1, mr: -1 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    variant="outlined"
                    required
                    fullWidth
                    id="firstName"
                    label="First Name"
                    name="firstName"
                    autoComplete="given-name"
                    autoFocus
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    error={!!errors.firstName}
                    helperText={errors.firstName || ""}
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
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    variant="outlined"
                    required
                    fullWidth
                    id="lastName"
                    label="Last Name"
                    name="lastName"
                    autoComplete="family-name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    error={!!errors.lastName}
                    helperText={errors.lastName || ""}
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
                    id="email"
                    label="Email Address"
                    name="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    error={!!errors.email}
                    helperText={errors.email || ""}
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
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    variant="outlined"
                    required
                    fullWidth
                    name="password"
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    id="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    error={!!errors.password}
                    helperText={errors.password || ""}
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

                <Grid item xs={12} sm={6}>
                  <TextField
                    variant="outlined"
                    required
                    fullWidth
                    name="confirmPassword"
                    label="Confirm Password"
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword || ""}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={toggleConfirmPasswordVisibility}
                            edge="end"
                            sx={{ 
                              color: theme.palette.text.secondary,
                              transition: 'transform 0.2s',
                              '&:hover': { transform: 'scale(1.1)' }
                            }}
                            size="small"
                          >
                            {showConfirmPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
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
            </Box>

            <Box sx={{ mt: 2 }}>
              <MotionButton
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                size="medium"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <PersonAddIcon />}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                sx={{ 
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
                {loading ? "Creating Account..." : "Register Now"}
              </MotionButton>

              <Box sx={{ position: 'relative', my: 2 }}>
                <Divider>
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ 
                      fontSize: '0.75rem',
                      px: 1,
                      backgroundColor: 'white'
                    }}
                  >
                    OR
                  </Typography>
                </Divider>
              </Box>

              <Box 
                sx={{ 
                  textAlign: 'center', 
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  py: 1.5,
                  borderRadius: 1
                }}
              >
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontWeight: 500,
                    color: theme.palette.text.primary
                  }}
                >
                  Already have an account?{" "}
                  <Link 
                    component={RouterLink} 
                    to="/login" 
                    variant="body2"
                    color="primary"
                    sx={{ 
                      fontWeight: 700,
                      textDecoration: 'none',
                      '&:hover': { 
                        textDecoration: 'underline',
                        color: theme.palette.primary.dark
                      }
                    }}
                  >
                    Sign In
                  </Link>
                </Typography>
              </Box>
            </Box>
          </Box>
        </MotionPaper>
      </Container>
    </MotionBox>
  );
};

export default Register;