import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ExpenseProvider } from "./contexts/ExpensesContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import notificationService from "./services/NotificationService";
// Pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Expenses from "./pages/Expenses";
import Categories from "./pages/Categories";
import Budgets from "./pages/Budgets";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import LoadingScreen from "./components/LoadingScreen";

// Component to initialize the notification service when user is authenticated
const NotificationServiceInitializer = ({ children }) => {
  const { user } = useAuth();
  
  useEffect(() => {
    // Start notification service when user logs in
    if (user) {
      console.log("Starting notification service");
      notificationService.start();
      
      // Clean up when component unmounts
      return () => {
        console.log("Stopping notification service");
        notificationService.stop();
      };
    }
  }, [user]);
  
  return children;
};

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // Show loading indicator while checking auth status
  if (loading) {
    return (
      <LoadingScreen
        message="Expense Tracker..."
        progress={50} // Replace with actual progress value
        secondaryMessage="Please wait while we verify your credentials."
      />
    );
  }

  if (!user) {
    return <Navigate to="/landing" replace />;
  }

  return children;
};

const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
  },
});

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/expenses"
        element={
          <ProtectedRoute>
            <Expenses />
          </ProtectedRoute>
        }
      />
      <Route
        path="/categories"
        element={
          <ProtectedRoute>
            <Categories />
          </ProtectedRoute>
        }
      />

      <Route
        path="/budgets"
        element={
          <ProtectedRoute>
            <Budgets />
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      {/* Add other routes as needed */}
      <Route
        path="*"
        element={
          user ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <NotificationProvider>
            <NotificationServiceInitializer>
              <ExpenseProvider>
                <AppRoutes />
              </ExpenseProvider>
            </NotificationServiceInitializer>
          </NotificationProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;