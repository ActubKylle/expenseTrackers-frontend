import React, { useEffect, useState } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import SavingsIcon from "@mui/icons-material/Savings";

/**
 * Enhanced LoadingScreen component with smooth animations and progress tracking
 * 
 * @param {Object} props
 * @param {string} props.message - Primary loading message
 * @param {string} props.secondaryMessage - Optional secondary message displayed below main message
 * @param {string} props.color - MUI color theme to use (primary, secondary, error, etc.)
 * @param {number} props.size - Size of the loading icon in pixels
 * @param {number} props.animationSpeed - Speed multiplier for animations (lower is faster)
 * @param {number} props.progress - Current progress value from 0-100
 * @returns {React.ReactElement} The LoadingScreen component
 */
const LoadingScreen = ({
  message = "Loading...",
  color = "primary",
  size = 80,
  animationSpeed = 1.5,
  progress = 100,
  secondaryMessage,
}) => {
  // State for animated progress value (for smoother transitions)
  const [animatedProgress, setAnimatedProgress] = useState(0);
  
  // Smoothly animate the progress value
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimatedProgress((prev) => {
        if (prev < progress) {
          return Math.min(prev + 1, progress);
        }
        return progress;
      });
    }, 20);
    
    return () => clearInterval(interval);
  }, [progress]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        background: (theme) =>
          `linear-gradient(-45deg, 
          ${theme.palette.background.paper}, 
          ${theme.palette.background.default}, 
          ${theme.palette.primary.light}20)`,
        backgroundSize: "400% 400%",
        animation: "gradient 15s ease infinite",
        color: "text.primary",
        textAlign: "center",
        px: 2,
        "@keyframes gradient": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
      }}
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      {/* Animated Savings Icon */}
      <Box
        sx={{
          position: "relative",
          mb: 4,
          animation: "bounce 1.5s infinite",
          "@keyframes bounce": {
            "0%, 100%": { transform: "translateY(0)" },
            "50%": { transform: "translateY(-15px)" },
          },
        }}
      >
        <SavingsIcon
          sx={{
            fontSize: size,
            color: (theme) => theme.palette[color].main,
            animation: `rotate ${animationSpeed * 3}s linear infinite`,
            filter: "drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1))",
            "@keyframes rotate": {
              from: { transform: "rotate(0deg)" },
              to: { transform: "rotate(360deg)" },
            },
          }}
        />
        {/* Glow effect */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: (theme) =>
              `radial-gradient(circle at center, 
              ${theme.palette[color].main} 0%, 
              transparent 70%)`,
            opacity: 0.3,
            pointerEvents: "none",
          }}
        />
      </Box>

      {/* Progress indicator with custom styling */}
      <CircularProgress
        size={size * 0.6}
        thickness={4}
        variant="determinate"
        value={animatedProgress}
        sx={{
          color: (theme) => theme.palette[color].main,
          mb: 3,
          "& .MuiCircularProgress-circle": {
            strokeLinecap: "round",
            transition: "stroke-dashoffset 0.3s ease",
          },
        }}
      />

      {/* Main message with fade animation */}
      <Typography
        variant="h6"
        sx={{
          mb: 1,
          fontWeight: 600,
          letterSpacing: "0.05em",
          animation: "fadeInOut 2s ease-in-out infinite",
          "@keyframes fadeInOut": {
            "0%, 100%": { opacity: 1 },
            "50%": { opacity: 0.5 },
          },
        }}
      >
        {message}
      </Typography>

      {/* Optional secondary message */}
      {secondaryMessage && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            maxWidth: "300px",
            lineHeight: 1.4,
          }}
        >
          {secondaryMessage}
        </Typography>
      )}

      {/* Progress percentage */}
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{
          position: "absolute",
          bottom: "20%",
          opacity: 0.8,
        }}
      >
        {animatedProgress}% loaded
      </Typography>
    </Box>
  );
};

export default LoadingScreen;