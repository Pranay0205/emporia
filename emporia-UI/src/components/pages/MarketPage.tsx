import { useEffect, useState } from "react";
import { Box, Container, SimpleGrid, Image, Text, Stack, Heading, Button, Portal, Skeleton } from "@chakra-ui/react";
import { Select } from "@chakra-ui/react";
import { toaster } from "@/components/ui/toaster";
import { createListCollection } from "@chakra-ui/react";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category_id: number;
  stock: number;
}

interface Category {
  id: number;
  name: string;
  description: string;
}

const MarketPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL;
  const placeholderImage = "https://placehold.in/300x200@2x.png/dark";
  const user = JSON.parse(sessionStorage.getItem("user") || "{}");

  const addToCart = async (productId: number) => {
    try {
      const response = await fetch(`${API_URL}/cart/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ cart_id: 0, product_id: productId, quantity: 1, user_id: user.id }),
      });

      if (!response.ok) {
        throw new Error("Failed to add item to cart");
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
        description: "Failed to add item to cart",
      });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch categories
        const categoryResponse = await fetch(`${API_URL}/categories`);
        if (!categoryResponse.ok) {
          throw new Error("Failed to fetch categories");
        }
        const categoryData = await categoryResponse.json();
        setCategories(categoryData.categories || []);

        // Fetch products
        const productResponse = await fetch(`${API_URL}/products`);
        if (!productResponse.ok) {
          throw new Error("Failed to fetch products");
        }
        const productData = await productResponse.json();
        setProducts(productData.products || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        toaster.create({
          type: "error",
          title: "Error",
          description: "Failed to load products and categories",
          meta: { pauseOnHover: true, closable: true },
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [API_URL]);

  const filteredProducts =
    selectedCategory === "all"
      ? products
      : products.filter((product) => product.category_id === parseInt(selectedCategory));

  const categoryCollection = createListCollection({
    items: [
      { label: "All Categories", value: "all" },
      ...categories.map((category) => ({
        label: category.name,
        value: category.id.toString(),
      })),
    ],
  });

  return (
    <Box minH="100vh" bg="gray.900" py={8}>
      <Container maxW="container.xl">
        <Stack gap={8}>
          <Heading color="white" textAlign="center">
            Marketplace
          </Heading>

          {/* Category Filter */}
          <Box>
            <Select.Root
              defaultValue={[selectedCategory]}
              onValueChange={(details) =>
                setSelectedCategory(Array.isArray(details.value) ? details.value[0] : details.value)
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

          {/* Product Grid */}
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} gap={6}>
            {isLoading
              ? Array.from({ length: 8 }).map((_, index) => <Skeleton key={index} height="400px" rounded="lg" />)
              : filteredProducts.map((product) => (
                  <Box
                    key={product.id}
                    bg="gray.800"
                    rounded="lg"
                    overflow="hidden"
                    transition="transform 0.2s"
                    _hover={{ transform: "translateY(-4px)" }}
                  >
                    <Box position="relative" height="200px">
                      <Image
                        src={product.image || placeholderImage}
                        alt={product.name}
                        height="100%"
                        width="100%"
                        objectFit="cover"
                      />
                    </Box>
                    <Stack p={4} gap={2}>
                      <Heading size="md" color="white">
                        {product.name}
                      </Heading>
                      <Text color="gray.400" truncate maxWidth="100%" display="-webkit-box">
                        {product.description}
                      </Text>
                      <Text color="teal.300" fontSize="xl" fontWeight="bold">
                        ${product.price}
                      </Text>
                      <Text color="gray.400" fontSize="sm">
                        Stock: {product.stock}
                      </Text>
                      <Button
                        colorScheme="teal"
                        size="sm"
                        disabled={product.stock === 0}
                        onClick={() => addToCart(product.id)}
                      >
                        {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                      </Button>
                    </Stack>
                  </Box>
                ))}
          </SimpleGrid>
        </Stack>
      </Container>
    </Box>
  );
};

export default MarketPage;
