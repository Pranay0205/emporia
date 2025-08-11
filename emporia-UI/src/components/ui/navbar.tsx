import {
  Box,
  Button,
  Container,
  Heading,
  HStack,
  Text,
  Menu,
  Portal,
  Avatar,
  Float,
  Circle,
  Center,
} from "@chakra-ui/react";
import { Link, useNavigate } from "react-router-dom";
import { toaster } from "./toaster";
import { FiShoppingCart, FiHome, FiGrid, FiPackage } from "react-icons/fi";
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
  const [user, setUser] = useState<{ first_name: string; last_name: string; email: string } | null>(null);
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
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

    if (isAuthenticated) {
      fetchCartData();
      const userData = sessionStorage.getItem("user");
      if (userData) {
        setUser(JSON.parse(userData));
      }
    }
  }, [isAuthenticated, API_URL]);

  const handleLogout = async () => {
    setTimeout(async () => {
      try {
        await fetch(`${API_URL}/auth/logout`, {
          method: 'POST',
          credentials: 'include'
        });
      } catch (error) {
        console.error('Logout error:', error);
      }
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
                    <FiHome style={{ marginRight: "8px" }} /> Market
                  </Button>
                </Link>
                <Link to="/categories">
                  <Button variant="ghost" color="white" _hover={{ bg: "whiteAlpha.200" }}>
                    <FiGrid style={{ marginRight: "8px" }} /> Categories
                  </Button>
                </Link>
                <Link to="/products">
                  <Button variant="ghost" color="white" _hover={{ bg: "whiteAlpha.200" }}>
                    <FiPackage style={{ marginRight: "8px" }} /> Products
                  </Button>
                </Link>
                <Link to="/cart">
                  <Button variant="ghost" color="white" _hover={{ bg: "whiteAlpha.200" }} position="relative">
                    <Float placement={"top-end"}>
                      <Circle size="5" bg="red" color="white">
                        <Center>{cartItems}</Center>
                      </Circle>
                    </Float>
                    <FiShoppingCart size={20} style={{ marginRight: "8px" }} /> Cart
                  </Button>
                </Link>
                <Menu.Root>
                  <Menu.Trigger>
                    <HStack>
                      {user && (
                        <Text color="white" fontSize="sm">
                          {user.first_name}
                        </Text>
                      )}
                      <Avatar.Root size="sm" bg="teal.500">
                        <Avatar.Fallback
                          className="cursor-pointer"
                          name={user ? user.first_name + " " + user.last_name : undefined}
                        ></Avatar.Fallback>
                      </Avatar.Root>
                    </HStack>
                  </Menu.Trigger>
                  <Portal>
                    <Menu.Positioner>
                      <Menu.Content bg="gray.800" borderColor="gray.700">
                        <Menu.Item value="orders" _hover={{ bg: "gray.700" }} onClick={() => navigate("/orders")}>
                          <Text color="white">Order History</Text>
                        </Menu.Item>
                        <Menu.Item value="profile" _hover={{ bg: "gray.700" }}>
                          <Text color="white">Profile</Text>
                        </Menu.Item>
                        <Menu.Item value="settings" _hover={{ bg: "gray.700" }}>
                          <Text color="white">Settings</Text>
                        </Menu.Item>
                        <Menu.Separator borderColor="gray.700" />
                        <Menu.Item value="logout" _hover={{ bg: "gray.700" }} onClick={handleLogout}>
                          <Text color="red.400">Logout</Text>
                        </Menu.Item>
                      </Menu.Content>
                    </Menu.Positioner>
                  </Portal>
                </Menu.Root>
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
