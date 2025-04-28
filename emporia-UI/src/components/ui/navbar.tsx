import { Box, Button, Container, Heading, HStack, Text } from "@chakra-ui/react";
import { Link, useNavigate } from "react-router-dom";
import { toaster } from "./toaster";
import { FiShoppingCart } from "react-icons/fi";
import { useEffect, useState } from "react";

export const Navbar = ({
  isAuthenticated,
  setIsAuth,
}: {
  isAuthenticated: boolean;
  setIsAuth: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState(0);
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    // Fetch cart data when authenticated
    if (isAuthenticated) {
      fetchCartData();
    }
  }, [isAuthenticated]);

  const fetchCartData = async () => {
    try {
      const response = await fetch(`${API_URL}/cart/`, {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setCartItems(data.cart.total_items);
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
    }
  };

  const handleLogout = () => {
    setTimeout(() => {
      sessionStorage.setItem("isAuthenticated", "false");
      setIsAuth(false);
      toaster.create({
        type: "success",
        title: "Logout Successful",
        description: "You have been logged out successfully.",
      });
    }, 1000);
    navigate("/market");
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
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
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
                <Link to="/products">
                  <Button variant="ghost" color="white" _hover={{ bg: "whiteAlpha.200" }}>
                    Products
                  </Button>
                </Link>
                <Link to="/cart">
                  <Button variant="ghost" color="white" _hover={{ bg: "whiteAlpha.200" }} position="relative">
                    <FiShoppingCart size={20} />
                    {cartItems > 0 && (
                      <Box
                        position="absolute"
                        top="-2"
                        right="-2"
                        bg="teal.400"
                        color="white"
                        borderRadius="full"
                        w="5"
                        h="5"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        fontSize="xs"
                      >
                        {cartItems}
                      </Box>
                    )}
                  </Button>
                </Link>
                <Link to="/" onClick={handleLogout}>
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
