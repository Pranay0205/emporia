import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Container, Heading, Stack, Text, VStack, NativeSelect, Table } from "@chakra-ui/react";
import { toaster } from "@/components/ui/toaster";

interface OrderRequest {
  cart_id: number;
  payment_method: string;
}

interface Cart {
  cart_id: number;
  items: Array<{
    id: number;
    name: string;
    category: string;
    price: number;
  }>;
  total_items: number;
  total_price: number;
}

const PlaceOrderPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [cart, setCart] = useState<Cart | null>(null);
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const user = sessionStorage.getItem("user");
        let userId;

        if (user) {
          const userObject = JSON.parse(user);
          userId = userObject.id;
        } else {
          // No user found, set an empty cart and exit
          setCart({
            cart_id: 0,
            customer_id: 0,
            items: [],
            total_items: 0,
            total_price: 0,
          });
          setIsLoading(false); // Make sure to handle loading state
          return;
        }

        // If a userId exists, proceed with the fetch request
        const response = await fetch(`${API_URL}/cart/${userId}`, {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch cart");
        }

        const data = await response.json();
        setCart(data.cart);
        console.log("Fetched cart:", data.cart);
      } catch (error) {
        console.error("Error fetching cart:", error);
        toaster.create({
          type: "error",
          title: "Error",
          description: `Failed to load cart items due to: ${error}`,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCart();
  }, [API_URL]);

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

      const response = await fetch(`${API_URL}/orders/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(orderRequest),
      });

      if (!response.ok) {
        throw new Error("Failed to place order");
      }

      const data = await response.json();
      toaster.create({
        type: "success",
        title: "Success",
        description: "Order placed successfully!",
      });

      // Navigate to order confirmation or orders page
      navigate(`/orders/${data.order_id}`);
    } catch (error) {
      console.error("Error placing order:", error);
      toaster.create({
        type: "error",
        title: "Error",
        description: "Failed to place order",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxW="container.xl" py={8}>
      <VStack gap={6} align="stretch">
        <Heading>Place Order</Heading>
        <Box p={6} borderWidth={1} borderRadius="lg" bg="gray.800">
          <Stack gap={4}>
            <Text fontSize="lg" fontWeight="bold">
              Payment Method
            </Text>
            <Table.Root size="sm">
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader>Product</Table.ColumnHeader>
                  <Table.ColumnHeader>Category</Table.ColumnHeader>
                  <Table.ColumnHeader textAlign="end">Price</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {cart?.items.map((item) => (
                  <Table.Row key={item.id + item.name}>
                    <Table.Cell>{item.name}</Table.Cell>
                    <Table.Cell>{item.category}</Table.Cell>
                    <Table.Cell textAlign="end">{item.price}</Table.Cell>
                  </Table.Row>
                ))}
                <Table.Row>
                  <Table.Cell colSpan={2} fontWeight="bold" textStyle="xl">
                    Total
                  </Table.Cell>
                  <Table.Cell textAlign="end" fontWeight="bold" textStyle="xl">
                    {cart?.total_price}
                  </Table.Cell>
                </Table.Row>
              </Table.Body>
            </Table.Root>
            <NativeSelect.Root
              value={paymentMethod}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setPaymentMethod(e.target.value)}
              variant="outline"
            >
              <NativeSelect.Field placeholder="Select payment method">
                <option value="Credit/Debit">Credit/Debit Card</option>
                <option value="Cash">Cash on Delivery</option>
              </NativeSelect.Field>
              <NativeSelect.Indicator />
            </NativeSelect.Root>

            <Button
              colorScheme="teal"
              size="lg"
              width="100%"
              onClick={placeOrder}
              loading={isLoading}
              loadingText="Placing Order..."
            >
              Place Order
            </Button>
          </Stack>
        </Box>
      </VStack>
    </Container>
  );
};

export default PlaceOrderPage;
