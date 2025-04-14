import { Box, Button, Container, Heading } from "@chakra-ui/react";
import { Link } from "react-router-dom";

export const Navbar = () => {
  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      right={0}
      bg="rgba(0, 0, 0, 0.8)"
      backdropFilter="blur(10px)"
      zIndex={10}
    >
      <Container maxW="container.xl">
        <Box py={4} display="flex" justifyContent="space-between" alignItems="center">
          <Link to="/">
            <Heading
              size="lg"
              color="white"
              _hover={{ color: "teal.400" }}
              transition="color 0.2s"
            >
              EMPORIA
            </Heading>
          </Link>
          <Box display="flex" gap={4}>
            <Link to="/login">
              <Button
                variant="ghost"
                color="white"
                _hover={{ bg: "whiteAlpha.200" }}
              >
                Login
              </Button>
            </Link>
            <Link to="/register">
              <Button
                colorScheme="teal"
                _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}
              >
                Get Started
              </Button>
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};