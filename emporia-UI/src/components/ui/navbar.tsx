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
import TokenManager from "../../utils/tokenManager";

export const Navbar = ({
  isAuthenticated,
  setIsAuth,
}: {
  isAuthenticated: boolean;
  setIsAuth: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState(0);
  const [user, setUser] = useState<{ 
    first_name: string; 
    last_name: string; 
    email: string; 
    role: string;
    user_name: string;
  } | null>(null);
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchCartData = async () => {
      try {
        // Updated: Use JWT token instead of credentials
        const response = await fetch(`${API_URL}/cart/`, {
          headers: {
            "Content-Type": "application/json",
            ...TokenManager.getAuthHeader(),
          },
        });
        if (response.ok) {
          const data = await response.json();
          setCartItems(data.cart.total_items || 0);
        } else if (response.status === 401) {
          // Token expired, logout user
          TokenManager.removeToken();
          setIsAuth(false);
          navigate('/login');
        }
      } catch (error) {
        console.error("Error fetching cart:", error);
      }
    };

    if (isAuthenticated) {
      // Updated: Get user data from TokenManager instead of sessionStorage
      const userData = TokenManager.getUser();
      if (userData) {
        setUser(userData);
        // Only fetch cart for customers
        if (userData.role === 'customer') {
          fetchCartData();
        }
      }
    } else {
      setUser(null);
      setCartItems(0);
    }
  }, [isAuthenticated, API_URL, setIsAuth, navigate]);

  const handleLogout = async () => {
    try {
      // Updated: Use JWT token for logout instead of credentials
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          ...TokenManager.getAuthHeader(),
        },
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    // Updated: Clear JWT token instead of sessionStorage
    TokenManager.removeToken();
    setIsAuth(false);
    setUser(null);
    setCartItems(0);
    
    toaster.create({
      type: "success",
      title: "Logout Successful",
      description: "You have been logged out successfully.",
    });
    navigate("/");
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
              // Authenticated Navbar with Role-based Navigation
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                {/* Market - Available to all authenticated users */}
                <Link to="/market">
                  <Button variant="ghost" color="white" _hover={{ bg: "whiteAlpha.200" }}>
                    <FiHome style={{ marginRight: "8px" }} /> Market
                  </Button>
                </Link>
                
                {/* Admin Only - Categories */}
                {user?.role === 'admin' && (
                  <Link to="/categories">
                    <Button variant="ghost" color="white" _hover={{ bg: "whiteAlpha.200" }}>
                      <FiGrid style={{ marginRight: "8px" }} /> Categories
                    </Button>
                  </Link>
                )}
                
                {/* Seller Only - Products */}
                {user?.role === 'seller' && (
                  <Link to="/products">
                    <Button variant="ghost" color="white" _hover={{ bg: "whiteAlpha.200" }}>
                      <FiPackage style={{ marginRight: "8px" }} /> My Products
                    </Button>
                  </Link>
                )}
                
                {/* Customer Only - Cart */}
                {user?.role === 'customer' && (
                  <Link to="/cart">
                    <Button variant="ghost" color="white" _hover={{ bg: "whiteAlpha.200" }} position="relative">
                      {cartItems > 0 && (
                        <Float placement={"top-end"}>
                          <Circle size="5" bg="red" color="white">
                            <Center>{cartItems}</Center>
                          </Circle>
                        </Float>
                      )}
                      <FiShoppingCart size={20} style={{ marginRight: "8px" }} /> Cart
                    </Button>
                  </Link>
                )}
                
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
                        {/* Customer Only - Order History */}
                        {user?.role === 'customer' && (
                          <Menu.Item value="orders" _hover={{ bg: "gray.700" }} onClick={() => navigate("/orders")}>
                            <Text color="white">Order History</Text>
                          </Menu.Item>
                        )}
                        
                        {/* Customer Only - Place Order */}
                        {user?.role === 'customer' && cartItems > 0 && (
                          <Menu.Item value="place-order" _hover={{ bg: "gray.700" }} onClick={() => navigate("/place-order")}>
                            <Text color="white">Place Order</Text>
                          </Menu.Item>
                        )}
                        
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