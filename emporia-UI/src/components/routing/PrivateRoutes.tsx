// emporia-UI/src/components/routing/PrivateRoutes.tsx
import React from 'react';
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Box, Text, Spinner, Flex } from '@chakra-ui/react';
import TokenManager from "../../utils/tokenManager";

interface PrivateRouteProps {
  requiredRole?: 'customer' | 'seller' | 'admin';
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ requiredRole }) => {
  const location = useLocation();

  // Check if user is authenticated
  const isAuthenticated = TokenManager.isAuthenticated();
  
  if (!isAuthenticated) {
    // Redirect to login page with the intended destination
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If role is required, check user's role
  if (requiredRole) {
    const user = TokenManager.getUser();
    
    if (!user) {
      // User data not found, redirect to login
      TokenManager.removeToken(); // Clean up invalid token
      return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (user.role !== requiredRole) {
      // User doesn't have required role, show unauthorized message or redirect
      return (
        <Flex justify="center" align="center" height="50vh" direction="column">
          <Box textAlign="center" p={8}>
            <Text fontSize="2xl" fontWeight="bold" color="red.500" mb={4}>
              Access Denied
            </Text>
            <Text fontSize="lg" color="gray.600" mb={4}>
              You don't have permission to access this page.
            </Text>
            <Text fontSize="md" color="gray.500">
              Required role: {requiredRole} | Your role: {user.role}
            </Text>
          </Box>
        </Flex>
      );
    }
  }

  // User is authenticated and has required role (if any), render child routes
  return <Outlet />;
};

export default PrivateRoute;