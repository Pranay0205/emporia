import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  SimpleGrid,
  Image,
  Text,
  Stack,
  Heading,
  Button,
  Portal,
  Skeleton,
} from "@chakra-ui/react";
import { Select } from "@chakra-ui/react";
import { toaster } from "@/components/ui/toaster";
import { createListCollection } from "@chakra-ui/react";
import TokenManager from "../../utils/tokenManager";

interface Product {
  product_id: number;
  name: string;
  description: string;
  price: number;
  image?: string;
  category_id: number;
  stock: number;
}

interface Category {
  category_id: number;
  name: string;
  description: string;
}

const MarketPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL;
  const placeholderImage = "https://picsum.photos/200/300";

  const addToCart = async (productId: number) => {
    try {
      // Check authentication
      if (!TokenManager.isAuthenticated()) {
        toaster.create({
          type: "error",
          title: "Authentication Required",
          description: "Please log in to add items to cart",
        });
        navigate("/login");
        return;
      }

      const user = TokenManager.getUser();
      if (!user || user.role !== "customer") {
        toaster.create({
          type: "error",
          title: "Customer Only",
          description: "Only customers can add items to cart",
        });
        return;
      }

      // Use JWT token for the request
      const response = await fetch(`${API_URL}/cart/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...TokenManager.getAuthHeader(),
        },
        body: JSON.stringify({
          product_id: productId,
          quantity: 1,
        }),
      });

      if (!response.ok) {
        // Handle 401 unauthorized
        if (response.status === 401) {
          TokenManager.removeToken();
          navigate("/login");
          return;
        }

        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to add item to cart");
      }

      await response.json();
      toaster.create({
        type: "success",
        title: "Success",
        description: "Item added to cart successfully",
      });
    } catch (error) {
      console.error("Error adding item to cart:", error);
      toaster.create({
        type: "error",
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to add item to cart",
      });
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Added authentication header for consistency
        const response = await fetch(`${API_URL}/categories`, {
          headers: {
            ...TokenManager.getAuthHeader(),
          },
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || "Failed to fetch categories");
        }

        const data = await response.json();
        setCategories(data.categories || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
        toaster.create({
          type: "error",
          title: "Error",
          description: "Failed to load categories",
        });
      }
    };

    const fetchProducts = async () => {
      try {
        // Added authentication header for consistency
        const response = await fetch(`${API_URL}/products`, {
          headers: {
            ...TokenManager.getAuthHeader(),
          },
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || "Failed to fetch products");
        }

        const data = await response.json();
        setProducts(data.products || []);
      } catch (error) {
        console.error("Error fetching products:", error);
        toaster.create({
          type: "error",
          title: "Error",
          description: "Failed to load products",
        });
      }
    };

    const fetchData = async () => {
      try {
        setIsLoading(true);
        await fetchCategories();
        await new Promise((resolve) => setTimeout(resolve, 200));
        await fetchProducts();
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    // Add delay to prevent rapid requests
    const timeoutId = setTimeout(() => {
      fetchData();
    }, 100); // 100ms delay

    return () => clearTimeout(timeoutId);
  }, [API_URL]);

  // Filter products by category
  const filteredProducts =
    selectedCategory === "all"
      ? products
      : products.filter(
          (product) => product.category_id.toString() === selectedCategory
        );

  const categoryCollection = createListCollection({
    items: [
      { label: "All Categories", value: "all" },
      ...(categories || []).map((category) => ({
        label: category.name,
        value: category.category_id.toString(),
      })),
    ],
  });

  const isCustomer = () => {
    const user = TokenManager.getUser();
    return user?.role === "customer";
  };

  const isAuthenticated = TokenManager.isAuthenticated();

  return (
    <Container maxW="container.xl" py={8}>
      <Stack gap={6}>
        {/* Header */}
        <Box textAlign="center">
          <Heading size="2xl" mb={4}>
            Emporia Marketplace
          </Heading>
          <Text fontSize="lg" color="gray.600">
            Discover amazing products from our sellers
          </Text>
        </Box>

        {/* Category Filter */}
        <Box>
          <Select.Root
            defaultValue={[selectedCategory]}
            onValueChange={(details) =>
              setSelectedCategory(
                Array.isArray(details.value) ? details.value[0] : details.value
              )
            }
            collection={categoryCollection}
            size="lg"
          >
            <Select.Label>Filter by Category</Select.Label>
            <Select.Control>
              <Select.Trigger>
                <Select.ValueText placeholder="Select category" />
              </Select.Trigger>
              <Select.IndicatorGroup>
                <Select.Indicator />
              </Select.IndicatorGroup>
            </Select.Control>
            <Portal>
              <Select.Positioner>
                <Select.Content>
                  {categoryCollection.items.map((item) => (
                    <Select.Item item={item} key={item.value}>
                      {item.label}
                      <Select.ItemIndicator />
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Positioner>
            </Portal>
          </Select.Root>
        </Box>

        {/* Products Grid */}
        {isLoading ? (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} gap={6}>
            {Array.from({ length: 8 }).map((_, index) => (
              <Box
                key={index}
                bg="white"
                borderRadius="lg"
                overflow="hidden"
                boxShadow="md"
              >
                <Skeleton height="200px" />
                <Box p={4}>
                  <Skeleton height="20px" mb={2} />
                  <Skeleton height="16px" mb={2} />
                  <Skeleton height="24px" width="60%" />
                </Box>
              </Box>
            ))}
          </SimpleGrid>
        ) : filteredProducts.length > 0 ? (
          <>
            <Text color="gray.600" mb={4}>
              Showing {filteredProducts.length} product
              {filteredProducts.length !== 1 ? "s" : ""}
              {selectedCategory !== "all" && " in selected category"}
            </Text>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} gap={6}>
              {filteredProducts.map((product) => (
                <Box
                  key={product.product_id}
                  bg="grey.200"
                  borderRadius="lg"
                  overflow="hidden"
                  boxShadow="md"
                  _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}
                  transition="all 0.2s"
                >
                  <Image
                    src={product.image || placeholderImage}
                    alt={product.name}
                    height="200px"
                    width="100%"
                    objectFit="cover"
                  />
                  <Box p={4}>
                    <Stack gap={2}>
                      <Heading size="md">{product.name}</Heading>
                      <Text color="gray.600" fontSize="sm">
                        {product.description}
                      </Text>
                      <Text fontSize="xl" fontWeight="bold" color="teal.600">
                        ${Number(product.price).toFixed(2)}
                      </Text>
                      <Text
                        fontSize="sm"
                        color={product.stock > 0 ? "green.600" : "red.600"}
                        fontWeight="medium"
                      >
                        {product.stock > 0
                          ? `${product.stock} in stock`
                          : "Out of stock"}
                      </Text>

                      {isAuthenticated ? (
                        isCustomer() ? (
                          <Button
                            colorScheme="blue"
                            onClick={() => addToCart(product.product_id)}
                            disabled={product.stock === 0}
                            width="100%"
                          >
                            {product.stock === 0
                              ? "Out of Stock"
                              : "Add to Cart"}
                          </Button>
                        ) : (
                          <Text
                            fontSize="sm"
                            color="gray.500"
                            textAlign="center"
                            py={2}
                          >
                            Login as customer to purchase
                          </Text>
                        )
                      ) : (
                        <Button
                          variant="outline"
                          onClick={() => navigate("/login")}
                          width="100%"
                        >
                          Login to Purchase
                        </Button>
                      )}
                    </Stack>
                  </Box>
                </Box>
              ))}
            </SimpleGrid>
          </>
        ) : (
          <Box textAlign="center" py={12}>
            <Text fontSize="lg" color="gray.600" mb={4}>
              {selectedCategory === "all"
                ? "No products available"
                : "No products found in this category"}
            </Text>
            {selectedCategory !== "all" && (
              <Button onClick={() => setSelectedCategory("all")}>
                View All Products
              </Button>
            )}
          </Box>
        )}
      </Stack>
    </Container>
  );
};

export default MarketPage;
