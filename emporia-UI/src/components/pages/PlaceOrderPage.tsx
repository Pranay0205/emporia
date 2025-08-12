import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Container, Heading, Stack, Text, VStack, NativeSelect, Table } from "@chakra-ui/react";
import { toaster } from "@/components/ui/toaster";
import TokenManager from "../../utils/tokenManager";

interface OrderRequest {
  cart_id: number;
  payment_method: string;
}

interface CartItem {
  product_id: number;
  name: string;
  category: string;
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

const PlaceOrderPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [cart, setCart] = useState<Cart | null>(null);
  const [fetchingCart, setFetchingCart] = useState(true);
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchCart = async () => {
      try {
        setFetchingCart(true);
        
        // Check if user is authenticated
        if (!TokenManager.isAuthenticated()) {
          navigate('/login');
          return;
        }

        // Updated: Use JWT token instead of credentials
        const response = await fetch(`${API_URL}/cart/`, {
          headers: {
            "Content-Type": "application/json",
            ...TokenManager.getAuthHeader(),
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
        console.log("Fetched cart:", data.cart);
        
        // Check if cart is empty
        if (!data.cart || data.cart.items.length === 0) {
          toaster.create({
            type: "info",
            title: "Empty Cart",
            description: "Your cart is empty. Redirecting to market...",
          });
          setTimeout(() => navigate('/market'), 2000);
        }
      } catch (error) {
        console.error("Error fetching cart:", error);
        toaster.create({
          type: "error",
          title: "Error",
          description: "Failed to load cart. Please try again.",
        });
        navigate('/cart');
      } finally {
        setFetchingCart(false);
      }
    };

    fetchCart();
  }, [API_URL, navigate]);

  const placeOrder = async () => {
    try {
      setIsLoading(true);

      if (!cart || cart.items.length === 0) {
        toaster.create({
          type: "error",
          title: "Error",
          description: "Your cart is empty",
        });
        return;
      }

      if (!paymentMethod) {
        toaster.create({
          type: "error",
          title: "Error",
          description: "Please select a payment method",
        });
        return;
      }

      const orderRequest: OrderRequest = {
        cart_id: cart.cart_id,
        payment_method: paymentMethod,
      };

      // Updated: Use JWT token instead of credentials
      const response = await fetch(`${API_URL}/orders/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...TokenManager.getAuthHeader(),
        },
        body: JSON.stringify(orderRequest),
      });

      if (!response.ok) {
        // Handle 401 unauthorized
        if (response.status === 401) {
          TokenManager.removeToken();
          navigate('/login');
          return;
        }
        throw new Error("Failed to place order");
      }

      const data = await response.json();
      toaster.create({
        type: "success",
        title: "Success",
        description: "Order placed successfully!",
      });

      // Navigate to order history instead of specific order
      navigate('/orders');
    } catch (error) {
      console.error("Error placing order:", error);
      toaster.create({
        type: "error",
        title: "Error",
        description: "Failed to place order. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while fetching cart
  if (fetchingCart) {
    return (
      <Container maxW="container.xl" py={8}>
        <VStack gap={6} align="stretch">
          <Heading>Place Order</Heading>
          <Box p={6} borderWidth={1} borderRadius="lg" bg="gray.800" textAlign="center">
            <Text>Loading cart details...</Text>
          </Box>
        </VStack>
      </Container>
    );
  }

  // Show message if cart is empty
  if (!cart || cart.items.length === 0) {
    return (
      <Container maxW="container.xl" py={8}>
        <VStack gap={6} align="stretch">
          <Heading>Place Order</Heading>
          <Box p={6} borderWidth={1} borderRadius="lg" bg="gray.800" textAlign="center">
            <Text mb={4}>Your cart is empty.</Text>
            <Button colorScheme="teal" onClick={() => navigate('/market')}>
              Continue Shopping
            </Button>
          </Box>
        </VStack>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack gap={6} align="stretch">
        <Heading>Place Order</Heading>
        
        {/* Order Summary */}
        <Box p={6} borderWidth={1} borderRadius="lg" bg="gray.800">
          <Stack gap={4}>
            <Text fontSize="lg" fontWeight="bold">
              Order Summary
            </Text>
            <Table.Root size="sm">
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader>Product</Table.ColumnHeader>
                  <Table.ColumnHeader>Quantity</Table.ColumnHeader>
                  <Table.ColumnHeader textAlign="end">Price</Table.ColumnHeader>
                  <Table.ColumnHeader textAlign="end">Subtotal</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {cart.items.map((item) => (
                  <Table.Row key={item.product_id}>
                    <Table.Cell>{item.name}</Table.Cell>
                    <Table.Cell>{item.quantity}</Table.Cell>
                    <Table.Cell textAlign="end">${item.price}</Table.Cell>
                    <Table.Cell textAlign="end">${item.subtotal}</Table.Cell>
                  </Table.Row>
                ))}
                <Table.Row>
                  <Table.Cell colSpan={3} fontWeight="bold" textStyle="xl">
                    Total ({cart.total_items} items)
                  </Table.Cell>
                  <Table.Cell textAlign="end" fontWeight="bold" textStyle="xl">
                    ${cart.total_price}
                  </Table.Cell>
                </Table.Row>
              </Table.Body>
            </Table.Root>
          </Stack>
        </Box>

        {/* Payment Method */}
        <Box p={6} borderWidth={1} borderRadius="lg" bg="gray.800">
          <Stack gap={4}>
            <Text fontSize="lg" fontWeight="bold">
              Payment Method
            </Text>
            <NativeSelect.Root
              value={paymentMethod}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setPaymentMethod(e.target.value)}
              variant="outline"
            >
              <NativeSelect.Field placeholder="Select payment method">
                <option value="">Choose payment method</option>
                <option value="Credit/Debit">Credit/Debit Card</option>
                <option value="Cash">Cash on Delivery</option>
                <option value="PayPal">PayPal</option>
                <option value="Bank Transfer">Bank Transfer</option>
              </NativeSelect.Field>
              <NativeSelect.Indicator />
            </NativeSelect.Root>

            <Stack direction="row" gap={4}>
              <Button
                variant="outline"
                size="lg"
                flex="1"
                onClick={() => navigate('/cart')}
              >
                Back to Cart
              </Button>
              <Button
                colorScheme="teal"
                size="lg"
                flex="2"
                onClick={placeOrder}
                loading={isLoading}
                loadingText="Placing Order..."
                disabled={!paymentMethod}
              >
                Place Order
              </Button>
            </Stack>
          </Stack>
        </Box>
      </VStack>
    </Container>
  );
};

export default PlaceOrderPage;