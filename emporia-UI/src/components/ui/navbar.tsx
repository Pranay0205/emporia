import { Box, Button, Container, Heading, HStack } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { toaster } from "./toaster";

export const Navbar = ({
  isAuthenticated,
  setIsAuth,
}: {
  isAuthenticated: boolean;
  setIsAuth: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const handleLogout = () => {
    {
      setTimeout(() => {
        sessionStorage.setItem("isAuthenticated", "false");
        setIsAuth(false);

        toaster.create({
          type: "success",
          title: "Logout Successful",
          description: "You have been logged out successfully.",
        });
      }, 1000); // Simulate a delay for logout
    }
  };
  return (
    <Box position="relative" top={0} left={0} right={0} bg="rgba(0, 0, 0, 0.8)" backdropFilter="blur(10px)" zIndex={10}>
      <Container maxW="container.xl">
        <Box py={4} display="flex" justifyContent="space-between" alignItems="center">
          <Link to="/">
            <Box display="flex" alignItems="center">
              <Heading size="lg" color="white" _hover={{ color: "teal.400" }} transition="color 0.2s">
                EMPORIA
              </Heading>
            </Box>
          </Link>
          <HStack gap={4}>
            {isAuthenticated ? (
              // Authenticated Navbar
              <div>
                <Link to="/market">
                  <Button variant="ghost" color="white" _hover={{ bg: "whiteAlpha.200" }}>
                    Market
                  </Button>
                </Link>
                <Link to="/categories">
                  <Button variant="ghost" color="white" _hover={{ bg: "whiteAlpha.200" }}>
                    Categories
                  </Button>
                </Link>
                <Link
                  to="/"
                  onClick={() => {
                    handleLogout();
                  }}
                >
                  <Button variant="ghost" color="red" _hover={{ bg: "whiteAlpha.800" }}>
                    Logout
                  </Button>
                </Link>
              </div>
            ) : (
              // Unauthenticated Navbar
              <>
                <Link to="/login">
                  <Button variant="ghost" color="white" _hover={{ bg: "whiteAlpha.200" }}>
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button colorScheme="teal" _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}>
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </HStack>
        </Box>
      </Container>
    </Box>
  );
};
