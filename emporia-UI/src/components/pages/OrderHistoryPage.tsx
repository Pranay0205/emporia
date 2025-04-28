import { useEffect, useState } from "react";
import { Box, Container, Heading, Text, Stack, Badge, Button, SimpleGrid } from "@chakra-ui/react";
import { toaster } from "@/components/ui/toaster";
import { useNavigate } from "react-router-dom";

interface OrderItem {
  product_id: number;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

interface Order {
  order_id: number;
  date: string;
  status: string;
  total_amount: number;
  items: OrderItem[];
}

const OrderHistoryPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${API_URL}/orders/`, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }
      const data = await response.json();
      setOrders(data.orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toaster.create({
        type: "error",
        title: "Error",
        description: "Failed to load orders",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const cancelOrder = async (orderId: number) => {
    try {
      const response = await fetch(`${API_URL}/orders/${orderId}/cancel`, {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to cancel order");
      }
      const data = await response.json();
      toaster.create({
        type: "success",
        title: "Success",
        description: data.message,
      });
      // Refresh orders after cancellation
      fetchOrders();
    } catch (error) {
      console.error("Error cancelling order:", error);
      toaster.create({
        type: "error",
        title: "Error",
        description: "Failed to cancel order",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "PAID":
        return "green";
      case "PROCESSING":
        return "blue";
      case "CANCELLED":
        return "red";
      default:
        return "gray";
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (isLoading) {
    return (
      <Container maxW="container.xl" py={8}>
        <Text>Loading orders...</Text>
      </Container>
    );
  }

  if (orders.length === 0) {
    return (
      <Container maxW="container.xl" py={8}>
        <Box textAlign="center">
          <Heading size="lg" mb={4}>
            No Orders Yet
          </Heading>
          <Text mb={4}>You haven't placed any orders yet.</Text>
          <Button colorScheme="teal" onClick={() => navigate("/market")}>
            Start Shopping
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <Heading mb={6}>Order History</Heading>
      <Stack gap={6}>
        {orders.map((order, index) => (
          <Box key={index} p={6} borderWidth={1} borderRadius="lg" bg="gray.800">
            <SimpleGrid columns={{ base: 1, md: 2 }} gap={4} mb={4}>
              <Stack>
                <Text fontSize="sm" color="gray.400">
                  Order #{order.order_id}
                </Text>
                <Text fontSize="sm" color="gray.400">
                  Placed on {new Date(order.date).toLocaleDateString()}
                </Text>
              </Stack>
              <Stack align={{ base: "start", md: "end" }}>
                <Badge colorPalette={getStatusColor(order.status)} variant="solid" fontSize="0.8em" px={2} py={1}>
                  {order.status.toUpperCase()}
                </Badge>
                <Text fontWeight="bold">Total: ${order.total_amount}</Text>
              </Stack>
            </SimpleGrid>

            <Stack gap={4}>
              {order.items.map((item) => (
                <SimpleGrid key={item.product_id} columns={{ base: 1, sm: 2 }} gap={4}>
                  <Text>{item.name}</Text>
                  <Stack direction="row" justify="space-between">
                    <Text color="gray.400">Qty: {item.quantity}</Text>
                    <Text>${item.subtotal}</Text>
                  </Stack>
                </SimpleGrid>
              ))}
            </Stack>
            <Box divideX="true" mt={4} borderTopWidth={1} borderColor="gray.700">
              <Box mt={4} right={{ base: "0", md: "4" }} textAlign={{ base: "center", md: "right" }}>
                <Button
                  colorPalette="red"
                  variant="solid"
                  size="sm"
                  onClick={() => cancelOrder(order.order_id)}
                  disabled={order.status.toLowerCase() === "cancelled"}
                >
                  Cancel Order
                </Button>
              </Box>
            </Box>
          </Box>
        ))}
      </Stack>
    </Container>
  );
};

export default OrderHistoryPage;
