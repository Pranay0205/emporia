import { useEffect, useState } from "react";
import { toaster } from "../ui/toaster";
import { Box, Button, Card, Image, Text } from "@chakra-ui/react";

const ProductPage = () => {
  interface User {
    id: number;
    first_name: string;
    last_name: string;
    username: string;
    email: string;
    role: string;
  }

  interface Category {
    id: number;
    name: string;
    description: string;
  }

  interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    categoryId: number;
    stock: number;
    imageUrl: string;
  }

  const API_URL = import.meta.env.VITE_API_URL;
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const isAuthenticated = sessionStorage.getItem("isAuthenticated");
  const [user, setUser] = useState<User | null>(null);

  if (!isAuthenticated) {
    toaster.create({
      type: "error",
      title: "Login Required",
      description: "You must be logged in to view this page.",
    });
  }

  useEffect(() => {
    const user = sessionStorage.getItem("user");
    if (!user) {
      toaster.create({
        type: "error",
        title: "User Not Found",
        description: "No user data found in session storage.",
      });
    } else {
      setUser(JSON.parse(user));

      console.log("User data:", JSON.parse(user));
    }
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_URL}/products`);
      if (!response.ok) {
        const errorData = await response.json();
        // Handle error response
        toaster.create({
          title: "Failed to fetch products",
          description: errorData.message || "An error occurred while fetching products.",
          meta: { pauseOnHover: true, closable: true },
          type: "error",
        });
        throw new Error(errorData.message || "Failed to fetch products");
      }

      // Check if the response is in JSON format
      const data = await response.json();

      setProducts(data.products || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/categories`);
      if (!response.ok) {
        const errorData = await response.json();
        // Handle error response
        toaster.create({
          title: "Failed to fetch categories",
          description: errorData.message || "An error occurred while fetching categories.",
          meta: { pauseOnHover: true, closable: true },
          type: "error",
        });
        throw new Error(errorData.message || "Failed to fetch categories");
      }

      // Check if the response is in JSON format
      const data = await response.json();

      setCategories(data.categories || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await fetchProducts();
      await fetchCategories();
    };

    fetchData();
  }, []);

  const productJSX = {
    products: products.map((product) => (
      <Box key={product.id} padding="4">
        <Card.Root maxW="sm" overflow="hidden">
          <Image src={product.imageUrl || "https://placehold.in/400x300"} alt={product.name} />
          <Card.Body gap="2">
            <Card.Title>{product.name}</Card.Title>
            <Card.Description>{product.description}</Card.Description>
            <Text textStyle="2xl" fontWeight="medium" letterSpacing="tight" mt="2">
              ${product.price}
            </Text>
            <Text>Stock: {product.stock}</Text>
          </Card.Body>
          <Card.Footer gap="2">
            <Button variant="solid" colorPalette="teal">
              Update
            </Button>
            <Button variant="solid" colorPalette="red">
              Delete
            </Button>
          </Card.Footer>
        </Card.Root>
      </Box>
    )),
  };

  return (
    <div>
      {user && user.role === "seller" && (
        <div>
          <Box padding="4" textAlign="center">
            <Text
              textStyle="7xl"
              className="flex items-center justify-center"
              fontWeight="bold"
              letterSpacing="tight"
              mt="2"
            >
              Your Products
            </Text>
          </Box>
          {isLoading ? (
            <p>Loading...</p>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {productJSX.products}
            </div>
          ) : (
            <p>No products found.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductPage;
