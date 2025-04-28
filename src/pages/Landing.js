import React, { useEffect } from 'react';
import { 
  Box, Container, Typography, Button, Grid, Paper, 
  Card, CardContent, CardMedia, Avatar, Divider,
  Stack, useTheme, useMediaQuery
} from '@mui/material';
import { 
  BarChart as ChartIcon, 
  Savings as SavingsIcon, 
  Category as CategoryIcon, 
  ShowChart as ShowChartIcon,
  CreditCard as CreditCardIcon,
  GitHub as GitHubIcon,
  LinkedIn as LinkedInIcon
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import AOS from 'aos';
import 'aos/dist/aos.css';

// Import dashboard screenshot
const dashboardImage = '/dashbord.png'; 

// Import developer profile images
const profile1 = '/profile1.png';
const profile2 = '/profile2.png';

// Motion components for animation
const MotionBox = motion(Box);
const MotionGrid = motion(Grid);
const MotionTypography = motion(Typography);
const MotionButton = motion(Button);
const MotionPaper = motion(Paper);
const MotionCard = motion(Card);

// Developer profiles
const developers = [
  {
    name: 'Kylle Acutb',
    role: 'Backend Developer',
    image: profile2,
    bio: 'Experienced Laravel developer specializing in RESTful API development, database optimization, and secure authentication systems.',
    github: 'https://github.com',
    linkedin: 'https://linkedin.com'
  },
  {
    name: 'Applegay Delicano',
    role: 'Frontend Developer',
    image: profile1,
    bio: 'React specialist with expertise in Material UI, responsive design, and creating intuitive user experiences for web applications.',
    github: 'https://github.com',
    linkedin: 'https://linkedin.com'
  }
];

// Features list
const features = [
  {
    title: 'Expense Tracking',
    description: 'Record and categorize your daily expenses with just a few clicks',
    icon: <CreditCardIcon fontSize="large" />
  },
  {
    title: 'Custom Categories',
    description: 'Create and manage custom categories with color coding',
    icon: <CategoryIcon fontSize="large" />
  },
  {
    title: 'Visual Analytics',
    description: 'Visualize your spending patterns with interactive charts',
    icon: <ChartIcon fontSize="large" />
  },
  {
    title: 'Budget Planning',
    description: 'Set budgets for different expense categories and track your progress',
    icon: <SavingsIcon fontSize="large" />
  },
  {
    title: 'Spending Trends',
    description: 'Identify spending trends and opportunities to save money',
    icon: <ShowChartIcon fontSize="large" />
  }
];

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.6 }
  }
};

const scaleUp = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: { 
    scale: 1,
    opacity: 1,
    transition: { duration: 0.5 }
  }
};

// Floating animation for hero image
const floatingAnimation = {
  animate: {
    y: [0, -15, 0],
    transition: {
      duration: 4,
      repeat: Infinity,
      repeatType: "reverse",
      ease: "easeInOut"
    }
  }
};

// Enhanced How It Works Component
const HowItWorksSection = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box sx={{ py: 8, bgcolor: 'grey.50' }}>
      <Container maxWidth="lg">
        <Box 
          sx={{ textAlign: 'center', mb: 6 }}
          data-aos="fade-up"
        >
          <Typography 
            variant="h3" 
            component="h2" 
            sx={{ 
              fontWeight: 'bold',
              mb: 2,
              background: 'linear-gradient(90deg, #1976d2, #42a5f5)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: 'inline-block'
            }}
          >
            How It Works
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              color: 'text.secondary',
              maxWidth: '700px',
              mx: 'auto'
            }}
          >
            Start managing your expenses in three simple steps
          </Typography>
        </Box>
        
        {/* Centered Timeline with Modern Styling */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            maxWidth: '800px',
            mx: 'auto',
            position: 'relative'
          }}
        >
          {/* Center line */}
          <Box
            sx={{
              position: 'absolute',
              height: '100%',
              width: '4px',
              bgcolor: 'rgba(25, 118, 210, 0.15)',
              left: '50%',
              transform: 'translateX(-50%)',
              display: { xs: 'none', md: 'block' }
            }}
          />

          {/* Step 1 */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              width: '100%',
              mb: 5,
              alignItems: 'center'
            }}
            data-aos={isMobile ? "fade-up" : "fade-right"}
          >
            <Box
              sx={{
                flex: 1,
                display: 'flex',
                justifyContent: { xs: 'center', md: 'flex-end' },
                pr: { xs: 0, md: 4 },
                pb: { xs: 2, md: 0 },
                position: 'relative'
              }}
            >
              <Box
                sx={{
                  textAlign: { xs: 'center', md: 'right' },
                  maxWidth: '300px'
                }}
              >
                <Typography variant="h5" component="span" sx={{ 
                  fontWeight: 'bold',
                  mb: 1,
                  display: 'block'
                }}>
                  Create an Account
                </Typography>
                <Typography variant="body1">
                  Sign up for free and set up your profile in seconds.
                </Typography>
              </Box>
            </Box>
            
            <Box 
              sx={{ 
                zIndex: 2,
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                bgcolor: 'primary.main',
                boxShadow: '0 0 0 8px rgba(25, 118, 210, 0.1)',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '1.5rem',
                mx: { xs: 0, md: 3 }
              }}
              data-aos="zoom-in"
            >
              1
            </Box>
            
            <Box sx={{ flex: 1, pl: { xs: 0, md: 4 }, display: { xs: 'none', md: 'block' } }} />
          </Box>

          {/* Step 2 */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              width: '100%',
              mb: 5,
              alignItems: 'center'
            }}
            data-aos={isMobile ? "fade-up" : "fade-left"}
            data-aos-delay="200"
          >
            <Box sx={{ flex: 1, pr: { xs: 0, md: 4 }, display: { xs: 'none', md: 'block' } }} />
            
            <Box 
              sx={{ 
                zIndex: 2,
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                bgcolor: 'primary.main',
                boxShadow: '0 0 0 8px rgba(25, 118, 210, 0.1)',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '1.5rem',
                mx: { xs: 0, md: 3 }
              }}
              data-aos="zoom-in"
              data-aos-delay="400"
            >
              2
            </Box>
            
            <Box
              sx={{
                flex: 1,
                display: 'flex',
                justifyContent: { xs: 'center', md: 'flex-start' },
                pl: { xs: 0, md: 4 },
                pt: { xs: 2, md: 0 },
                position: 'relative'
              }}
            >
              <Box
                sx={{
                  textAlign: { xs: 'center', md: 'left' },
                  maxWidth: '300px'
                }}
              >
                <Typography variant="h5" component="span" sx={{ 
                  fontWeight: 'bold',
                  mb: 1,
                  display: 'block'
                }}>
                  Set Up Categories
                </Typography>
                <Typography variant="body1">
                  Create custom categories for different types of expenses.
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Step 3 */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              width: '100%',
              alignItems: 'center'
            }}
            data-aos={isMobile ? "fade-up" : "fade-right"}
            data-aos-delay="400"
          >
            <Box
              sx={{
                flex: 1,
                display: 'flex',
                justifyContent: { xs: 'center', md: 'flex-end' },
                pr: { xs: 0, md: 4 },
                pb: { xs: 2, md: 0 },
                position: 'relative'
              }}
            >
              <Box
                sx={{
                  textAlign: { xs: 'center', md: 'right' },
                  maxWidth: '300px'
                }}
              >
                <Typography variant="h5" component="span" sx={{ 
                  fontWeight: 'bold',
                  mb: 1,
                  display: 'block'
                }}>
                  Track Your Spending
                </Typography>
                <Typography variant="body1">
                  Record expenses and gain insights through analytics.
                </Typography>
              </Box>
            </Box>
            
            <Box 
              sx={{ 
                zIndex: 2,
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                bgcolor: 'primary.main',
                boxShadow: '0 0 0 8px rgba(25, 118, 210, 0.1)',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '1.5rem',
                mx: { xs: 0, md: 3 }
              }}
              data-aos="zoom-in"
              data-aos-delay="600"
            >
              3
            </Box>
            
            <Box sx={{ flex: 1, pl: { xs: 0, md: 4 }, display: { xs: 'none', md: 'block' } }} />
          </Box>
        </Box>
        
        <Box 
          sx={{ textAlign: 'center', mt: 5 }}
          data-aos="zoom-in"
          data-aos-delay="800"
        >
          <Button 
            component={RouterLink}
            to="/register"
            variant="contained" 
            color="primary" 
            size="large"
            sx={{ 
              px: 4, 
              py: 1.5,
              borderRadius: '30px',
              background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
              boxShadow: '0 4px 20px rgba(25, 118, 210, 0.3)',
              '&:hover': {
                boxShadow: '0 6px 25px rgba(25, 118, 210, 0.5)',
              }
            }}
            className="pulse-animation"
          >
            Get Started Now
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

const Landing = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));

  // Initialize AOS for scrolling animations
  useEffect(() => {
    AOS.init({
      duration: 700,
      easing: 'ease-out',
      once: false,
      mirror: true,
    });
    
    // Refresh AOS when components update
    AOS.refresh();
  }, []);

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Header/Navbar */}
      <Box 
        sx={{ 
          p: 2, 
          bgcolor: '#fff', 
          boxShadow: 1,
          position: 'sticky',
          top: 0,
          zIndex: 1100
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography 
              variant="h5" 
              component={motion.div}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              sx={{ 
                fontWeight: 'bold', 
                color: 'primary.main',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <SavingsIcon sx={{ mr: 1 }} /> Expense Tracker
            </Typography>
            <Box
              component={motion.div}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Button 
                component={RouterLink} 
                to="/login" 
                color="primary"
                sx={{ mr: 1 }}
              >
                Login
              </Button>
              <Button 
                component={RouterLink} 
                to="/register" 
                variant="contained" 
                color="primary"
              >
                Sign Up
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Hero Section */}
      <Box 
        sx={{ 
          bgcolor: 'primary.main', 
          color: 'white',
          py: { xs: 6, md: 10 },
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <MotionGrid 
              item xs={12} md={6}
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
            >
              <MotionTypography 
                variant="h2" 
                component="h1" 
                variants={fadeInUp}
                sx={{ 
                  fontWeight: 'bold',
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  mb: 2
                }}
              >
                Take Control of Your Finances
              </MotionTypography>
              <MotionTypography 
                variant="h5" 
                variants={fadeInUp}
                sx={{ 
                  mb: 4,
                  opacity: 0.9,
                  fontWeight: 300
                }}
              >
                Track expenses, manage budgets, and achieve your financial goals with our easy-to-use expense tracker.
              </MotionTypography>
              <MotionButton 
                component={RouterLink}
                to="/register"
                variant="contained" 
                size="large"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                sx={{ 
                  bgcolor: 'white',
                  color: 'primary.main',
                  fontWeight: 'bold',
                  px: 4,
                  py: 1.5,
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.9)',
                  }
                }}
              >
                Get Started for Free
              </MotionButton>
            </MotionGrid>
            <Grid item xs={12} md={6}>
              <Box 
                sx={{ 
                  position: 'relative',
                  pl: { md: 4 },
                  mt: { xs: 4, md: 0 }
                }}
              >
                <MotionPaper 
                  elevation={10}
                  variants={floatingAnimation}
                  animate="animate"
                  sx={{ 
                    borderRadius: 2,
                    overflow: 'hidden',
                    transform: 'perspective(1000px) rotateY(-5deg) rotateX(5deg)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'perspective(1000px) rotateY(0deg) rotateX(0deg)',
                    }
                  }}
                ><img 
                    src={dashboardImage} 
                    alt="Expense Tracker Dashboard" 
                    style={{ 
                      width: '100%',
                      height: 'auto',
                      display: 'block'
                    }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/600x400?text=Dashboard+Preview';
                    }}
                  />
                </MotionPaper>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ py: 8 }}>
        <Container maxWidth="lg">
          <Box 
            sx={{ textAlign: 'center', mb: 6 }}
            data-aos="fade-up"
          >
            <Typography 
              variant="h3" 
              component="h2" 
              sx={{ 
                fontWeight: 'bold',
                mb: 2
              }}
            >
              Powerful Features
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                color: 'text.secondary',
                maxWidth: '700px',
                mx: 'auto'
              }}
            >
              Everything you need to manage your personal finances in one place
            </Typography>
          </Box>
          
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card 
                  data-aos="zoom-in"
                  data-aos-delay={index * 100}
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    borderRadius: 2,
                    overflow: 'hidden',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: 6
                    }
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box 
                      sx={{ 
                        display: 'flex',
                        alignItems: 'center',
                        mb: 2,
                        color: 'primary.main'
                      }}
                    >
                      {feature.icon}
                      <Typography 
                        variant="h5" 
                        component="div" 
                        sx={{ 
                          fontWeight: 'bold',
                          ml: 1
                        }}
                      >
                        {feature.title}
                      </Typography>
                    </Box>
                    <Typography variant="body1" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* How It Works Section - Enhanced and Modern */}
      <HowItWorksSection />

      {/* Development Team Section */}
      <Box sx={{ py: 8 }}>
        <Container maxWidth="lg">
          <Box 
            sx={{ textAlign: 'center', mb: 6 }}
            data-aos="fade-up"
          >
            <Typography 
              variant="h3" 
              component="h2" 
              sx={{ 
                fontWeight: 'bold',
                mb: 2
              }}
            >
              Meet the Team
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                color: 'text.secondary',
                maxWidth: '700px',
                mx: 'auto'
              }}
            >
              The talented developers behind the Expense Tracker application
            </Typography>
          </Box>
          
          <Grid container spacing={4} justifyContent="center">
            {developers.map((developer, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card 
                  data-aos="flip-up"
                  data-aos-delay={index * 200}
                  sx={{ 
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    height: '100%',
                    overflow: 'hidden',
                    borderRadius: 2
                  }}
                >
                  <CardMedia
                    component="img"
                    sx={{ 
                      width: { xs: '100%', sm: 180 },
                      height: { xs: 240, sm: 'auto' }
                    }}
                    image={developer.image}
                    alt={developer.name}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://ui-avatars.com/api/?name=${developer.name.replace(' ', '+')}&size=200&background=random`;
                    }}
                  />
                  <CardContent sx={{ py: 3 }}>
                    <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
                      {developer.name}
                    </Typography>
                    <Typography variant="subtitle1" color="primary" sx={{ mb: 2 }}>
                      {developer.role}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" paragraph>
                      {developer.bio}
                    </Typography>
                    <Stack direction="row" spacing={1}>
                      <Button 
                        variant="outlined" 
                        size="small" 
                        startIcon={<GitHubIcon />}
                        href={developer.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ borderRadius: 8 }}
                      >
                        GitHub
                      </Button>
                      <Button 
                        variant="outlined" 
                        size="small" 
                        startIcon={<LinkedInIcon />}
                        href={developer.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ borderRadius: 8 }}
                      >
                        LinkedIn
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box 
        sx={{ 
          py: 8, 
          bgcolor: 'primary.dark',
          color: 'white'
        }}
        data-aos="fade"
      >
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center' }}>
            <Typography 
              variant="h3" 
              component="h2" 
              data-aos="zoom-in"
              sx={{ 
                fontWeight: 'bold',
                mb: 3
              }}
            >
              Ready to Get Started?
            </Typography>
            <Typography 
              variant="h6" 
              data-aos="fade-up"
              data-aos-delay="200"
              sx={{ 
                opacity: 0.9,
                mb: 4,
                maxWidth: '800px',
                mx: 'auto'
              }}
            >
              Join thousands of users who are already managing their finances more effectively with our Expense Tracker.
            </Typography>
            <MotionButton 
              component={RouterLink}
              to="/register"
              variant="contained" 
              color="secondary" 
              size="large"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              data-aos="flip-up"
              data-aos-delay="400"
              sx={{ 
                px: 5, 
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 'bold',
                borderRadius: '30px',
                background: 'linear-gradient(45deg, #f48fb1, #ec407a)',
                boxShadow: '0 4px 20px rgba(236, 64, 122, 0.4)'
              }}
            >
              Sign Up for Free
            </MotionButton>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box 
        sx={{ 
          py: 4, 
          bgcolor: 'background.paper',
          borderTop: 1,
          borderColor: 'divider'
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography 
                variant="h6" 
                component="div" 
                sx={{ 
                  fontWeight: 'bold', 
                  color: 'primary.main',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <SavingsIcon sx={{ mr: 1 }} /> Expense Tracker
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                © {new Date().getFullYear()} Expense Tracker. All rights reserved.
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' }, mt: { xs: 2, md: 0 } }}>
                <Button color="inherit" sx={{ mr: 2 }}>
                  Privacy Policy
                </Button>
                <Button color="inherit">
                  Terms of Service
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Custom CSS for Animations */}
      <style jsx global>{`
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(25, 118, 210, 0.7);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(25, 118, 210, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(25, 118, 210, 0);
          }
        }
        
        .pulse-animation {
          animation: pulse 2s infinite;
        }
        
        /* Add smooth scrolling to the whole page */
        html {
          scroll-behavior: smooth;
        }
        
        /* Mobile-specific enhancements */
        @media (max-width: 600px) {
          /* Improve font rendering */
          body {
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
          
          /* Ensure touch targets are large enough */
          button, a {
            min-height: 44px;
            min-width: 44px;
          }
          
          /* Optimize scrolling */
          * {
            -webkit-overflow-scrolling: touch;
          }
        }
      `}</style>
    </Box>
  );
};

export default Landing;