import { useEffect, useState, useCallback } from "react";
import { Box, Button, Container, Heading, Image, Stack, Text, SimpleGrid } from "@chakra-ui/react";
import { toaster } from "@/components/ui/toaster";
import { useNavigate } from "react-router-dom";
import TokenManager from "../../utils/tokenManager";

interface CartItem {
  product_id: number;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

interface Cart {
  cart_id: number;
  customer_id: number;
  items: CartItem[];
  total_items: number;
  total_price: number;
}

const CartPage = () => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  const fetchCart = useCallback(async () => {
    try {
      // Updated: Use JWT token instead of credentials
      const response = await fetch(`${API_URL}/cart/`, {
        headers: {
          "Content-Type": "application/json",
          ...TokenManager.getAuthHeader(), // Add JWT token to header
        },
      });
      
      if (!response.ok) {
        // Handle 401 unauthorized
        if (response.status === 401) {
          TokenManager.removeToken();
          navigate('/login');
          return;
        }
        throw new Error("Failed to fetch cart");
      }
      
      const data = await response.json();
      setCart(data.cart);
    } catch (error) {
      console.error("Error fetching cart:", error);
      toaster.create({
        type: "error",
        title: "Error",
        description: "Failed to load cart items",
      });
    } finally {
      setIsLoading(false);
    }
  }, [API_URL, navigate]);

  const updateQuantity = async (productId: number, newQuantity: number) => {
    try {
      // Updated: Use JWT token instead of credentials
      const response = await fetch(`${API_URL}/cart/items/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...TokenManager.getAuthHeader(), // Add JWT token to header
        },
        body: JSON.stringify({ quantity: newQuantity }),
      });

      if (!response.ok) {
        // Handle 401 unauthorized
        if (response.status === 401) {
          TokenManager.removeToken();
          navigate('/login');
          return;
        }
        throw new Error("Failed to update quantity");
      }

      const data = await response.json();
      setCart(data.cart);
      toaster.create({
        type: "success",
        title: "Success",
        description: "Cart updated successfully",
      });
    } catch (error) {
      console.error("Error updating quantity:", error);
      toaster.create({
        type: "error",
        title: "Error",
        description: "Failed to update cart",
      });
    }
  };

  const removeItem = async (productId: number) => {
    try {
      // Updated: Use JWT token instead of credentials
      const response = await fetch(`${API_URL}/cart/items/${productId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...TokenManager.getAuthHeader(), // Add JWT token to header
        },
      });

      if (!response.ok) {
        // Handle 401 unauthorized
        if (response.status === 401) {
          TokenManager.removeToken();
          navigate('/login');
          return;
        }
        throw new Error("Failed to remove item");
      }

      // Refresh cart after successful removal
      await fetchCart();
      toaster.create({
        type: "success",
        title: "Success",
        description: "Item removed from cart",
      });
    } catch (error) {
      console.error("Error removing item:", error);
      toaster.create({
        type: "error",
        title: "Error",
        description: "Failed to remove item from cart",
      });
    }
  };

  useEffect(() => {
    // Check if user is authenticated before fetching cart
    if (TokenManager.isAuthenticated()) {
      fetchCart();
    } else {
      navigate('/login');
    }
  }, [fetchCart, navigate]);

  if (isLoading) {
    return (
      <Container maxW="container.xl" py={8}>
        <Text>Loading cart...</Text>
      </Container>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <Container maxW="container.xl" py={8}>
        <Box textAlign="center">
          <Heading size="lg" mb={4}>
            Your Cart is Empty
          </Heading>
          <Text mb={4}>Start shopping to add items to your cart!</Text>
          <Button colorScheme="teal" onClick={() => navigate("/market")}>
            Go to Market
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <Heading mb={6}>Shopping Cart</Heading>
      <SimpleGrid columns={{ base: 1, lg: 2 }} gap={8}>
        <Stack gap={4}>
          {cart.items.map((item) => (
            <Box
              key={item.product_id}
              p={4}
              borderWidth={1}
              borderRadius="lg"
              bg="gray.800"
              display="flex"
              alignItems="center"
              gap={4}
            >
              <Image
                src="https://placehold.co/100x100"
                alt={item.name}
                w={100}
                h={100}
                objectFit="cover"
                borderRadius="md"
              />
              <Stack flex={1}>
                <Text fontSize="lg" fontWeight="bold">
                  {item.name}
                </Text>
                <Text>${item.price}</Text>
                <Stack direction="row" alignItems="center">
                  <Button
                    size="sm"
                    onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                  >
                    -
                  </Button>
                  <Text>{item.quantity}</Text>
                  <Button size="sm" onClick={() => updateQuantity(item.product_id, item.quantity + 1)}>
                    +
                  </Button>
                  <Button size="sm" colorScheme="red" ml="auto" onClick={() => removeItem(item.product_id)}>
                    Remove
                  </Button>
                </Stack>
              </Stack>
            </Box>
          ))}
        </Stack>
        <Box p={6} borderWidth={1} borderRadius="lg" bg="gray.800" height="fit-content">
          <Heading size="md" mb={4}>
            Order Summary
          </Heading>
          <Stack gap={3}>
            <Box display="flex" justifyContent="space-between">
              <Text>Items ({cart.total_items})</Text>
              <Text>${cart.total_price}</Text>
            </Box>
            <Box pt={4} borderTopWidth={1}>
              <Button colorScheme="teal" size="lg" width="100%" onClick={() => navigate("/place-order")}>
                Proceed to Checkout
              </Button>
            </Box>
          </Stack>
        </Box>
      </SimpleGrid>
    </Container>
  );
};

export default CartPage;