import { useEffect, useState } from "react";
import { Box, Container, Heading, Text, Stack, Badge, Button, SimpleGrid } from "@chakra-ui/react";
import { toaster } from "@/components/ui/toaster";
import { useNavigate } from "react-router-dom";
import TokenManager from "../../utils/tokenManager";

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
      setIsLoading(true);
      
      // Check if user is authenticated
      if (!TokenManager.isAuthenticated()) {
        navigate('/login');
        return;
      }

      // Updated: Use JWT token instead of credentials
      const response = await fetch(`${API_URL}/orders/`, {
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
        throw new Error("Failed to fetch orders");
      }
      
      const data = await response.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toaster.create({
        type: "error",
        title: "Error",
        description: "Failed to load orders. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const cancelOrder = async (orderId: number) => {
    try {
      // Check if user is authenticated
      if (!TokenManager.isAuthenticated()) {
        navigate('/login');
        return;
      }

      // Updated: Use JWT token instead of credentials
      const response = await fetch(`${API_URL}/orders/${orderId}/cancel`, {
        method: "POST",
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
        throw new Error("Failed to cancel order");
      }
      
      const data = await response.json();
      toaster.create({
        type: "success",
        title: "Success",
        description: data.message || "Order cancelled successfully",
      });
      
      // Refresh orders after cancellation
      fetchOrders();
    } catch (error) {
      console.error("Error cancelling order:", error);
      toaster.create({
        type: "error",
        title: "Error",
        description: "Failed to cancel order. Please try again.",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
      case "completed":
      case "delivered":
        return "green";
      case "processing":
      case "pending":
        return "blue";
      case "cancelled":
      case "canceled":
        return "red";
      case "shipped":
        return "orange";
      default:
        return "gray";
    }
  };

  const canCancelOrder = (status: string) => {
    const nonCancellableStatuses = ['cancelled', 'canceled', 'delivered', 'shipped'];
    return !nonCancellableStatuses.includes(status.toLowerCase());
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  };

  const viewOrderDetails = (orderId: number) => {
    // Navigate to order details page if it exists
    navigate(`/orders/${orderId}`);
  };

  useEffect(() => {
    // Check authentication before fetching orders
    if (TokenManager.isAuthenticated()) {
      fetchOrders();
    } else {
      navigate('/login');
    }
  }, [navigate]);

  if (isLoading) {
    return (
      <Container maxW="container.xl" py={8}>
        <Heading mb={6}>Order History</Heading>
        <Box p={6} borderWidth={1} borderRadius="lg" bg="gray.800" textAlign="center">
          <Text>Loading your orders...</Text>
        </Box>
      </Container>
    );
  }

  if (orders.length === 0) {
    return (
      <Container maxW="container.xl" py={8}>
        <Heading mb={6}>Order History</Heading>
        <Box p={6} borderWidth={1} borderRadius="lg" bg="gray.800" textAlign="center">
          <Heading size="lg" mb={4}>
            No Orders Yet
          </Heading>
          <Text mb={4} color="gray.400">
            You haven't placed any orders yet. Start shopping to see your order history here!
          </Text>
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
      <Text mb={4} color="gray.400">
        {orders.length} order{orders.length !== 1 ? 's' : ''} found
      </Text>
      
      <Stack gap={6}>
        {orders.map((order, index) => (
          <Box key={order.order_id || index} p={6} borderWidth={1} borderRadius="lg" bg="gray.800">
            <SimpleGrid columns={{ base: 1, md: 2 }} gap={4} mb={4}>
              <Stack>
                <Text fontSize="lg" fontWeight="bold">
                  Order #{order.order_id}
                </Text>
                <Text fontSize="sm" color="gray.400">
                  Placed on {formatDate(order.date)}
                </Text>
              </Stack>
              <Stack align={{ base: "start", md: "end" }}>
                <Badge 
                  colorPalette={getStatusColor(order.status)} 
                  variant="solid" 
                  fontSize="0.8em" 
                  px={2} 
                  py={1}
                >
                  {order.status.toUpperCase()}
                </Badge>
                <Text fontWeight="bold" fontSize="lg">
                  Total: ${order.total_amount?.toFixed(2)}
                </Text>
              </Stack>
            </SimpleGrid>

            {/* Order Items */}
            <Box mb={4}>
              <Text fontSize="md" fontWeight="semibold" mb={2}>
                Items ({order.items?.length || 0}):
              </Text>
              <Stack gap={3}>
                {order.items?.map((item) => (
                  <Box 
                    key={item.product_id} 
                    p={3} 
                    bg="gray.700" 
                    borderRadius="md"
                  >
                    <SimpleGrid columns={{ base: 1, sm: 3 }} gap={2}>
                      <Text fontWeight="medium">{item.name}</Text>
                      <Text color="gray.400" fontSize="sm">
                        Qty: {item.quantity} × ${item.price?.toFixed(2)}
                      </Text>
                      <Text textAlign={{ base: "left", sm: "right" }} fontWeight="medium">
                        ${item.subtotal?.toFixed(2)}
                      </Text>
                    </SimpleGrid>
                  </Box>
                ))}
              </Stack>
            </Box>

            {/* Action Buttons */}
            <Box borderTopWidth={1} borderColor="gray.700" pt={4}>
              <Stack direction={{ base: "column", sm: "row" }} gap={3}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => viewOrderDetails(order.order_id)}
                >
                  View Details
                </Button>
                
                {canCancelOrder(order.status) && (
                  <Button
                    colorScheme="red"
                    variant="solid"
                    size="sm"
                    onClick={() => cancelOrder(order.order_id)}
                  >
                    Cancel Order
                  </Button>
                )}
                
                {order.status.toLowerCase() === 'delivered' && (
                  <Button
                    colorScheme="green"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      toaster.create({
                        type: "info",
                        title: "Feature Coming Soon",
                        description: "Order review feature is coming soon!",
                      });
                    }}
                  >
                    Write Review
                  </Button>
                )}
              </Stack>
            </Box>
          </Box>
        ))}
      </Stack>
      
      {/* Refresh Button */}
      <Box textAlign="center" mt={6}>
        <Button 
          variant="outline" 
          onClick={fetchOrders}
          disabled={isLoading}
        >
          Refresh Orders
        </Button>
      </Box>
    </Container>
  );
};

export default OrderHistoryPage;