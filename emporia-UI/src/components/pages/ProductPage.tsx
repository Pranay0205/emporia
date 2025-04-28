import { useEffect, useState } from "react";
import { toaster } from "../ui/toaster";
import {
  Box,
  Button,
  Card,
  Image,
  Input,
  Text,
  Dialog,
  Field,
  Portal,
  CloseButton,
  createListCollection,
  NativeSelect,
  Flex,
} from "@chakra-ui/react";

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
  const [user, setUser] = useState<User | null>(null);
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    category_id: "",
    seller_id: user ? user.id : 0,
    stock: "",
    imageUrl: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newProduct),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to create product");
      }

      toaster.create({
        type: "success",
        title: "Success",
        description: "Product created successfully",
      });

      setNewProduct({
        name: "",
        description: "",
        price: "",
        category_id: "",
        stock: "",
        seller_id: user ? user.id : 0,
        imageUrl: "",
      });
    } catch (error: Error | unknown) {
      toaster.create({
        type: "error",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create product",
      });
    }
  };

  // Check if user data is in session storage
  useEffect(() => {
    const user = sessionStorage.getItem("user");
    const isAuthenticated = sessionStorage.getItem("isAuthenticated");

    if (!isAuthenticated) {
      toaster.create({
        type: "error",
        title: "Login Required",
        description: "You must be logged in to view this page.",
      });
      throw new Error("User is not authenticated");
    }

    if (!user) {
      toaster.create({
        type: "error",
        title: "User Not Found",
        description: "No user data found in session storage.",
      });
      throw new Error("User not found in session storage");
    } else {
      setUser(JSON.parse(user));

      console.log("User data:", JSON.parse(user));
    }
  }, []);

  const categoryCollection = createListCollection({
    items: categories.map((category) => ({
      label: category.name,
      value: category.id.toString(),
    })),
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch data in parallel
        const productsResponse = await fetch(`${API_URL}/products`);

        const categoriesResponse = await fetch(`${API_URL}/categories`);
        // Handle products response
        if (!productsResponse.ok) {
          let errorMessage = "Failed to fetch products";
          try {
            const errorData = await productsResponse.json();
            errorMessage = errorData.message || errorMessage;
          } catch (e) {
            console.error("Error parsing products response:", e);
          }

          toaster.create({
            title: "Failed to fetch products",
            description: errorMessage,
            meta: { pauseOnHover: true, closable: true },
            type: "error",
          });
          throw new Error(errorMessage);
        }

        // Handle categories response
        if (!categoriesResponse.ok) {
          let errorMessage = "Failed to fetch categories";
          try {
            const errorData = await categoriesResponse.json();
            errorMessage = errorData.message || errorMessage;
          } catch (e) {
            // Response wasn't valid JSON
            console.error("Error parsing categories response:", e);
          }

          toaster.create({
            title: "Failed to fetch categories",
            description: errorMessage,
            meta: { pauseOnHover: true, closable: true },
            type: "error",
          });
          throw new Error(errorMessage);
        }

        // Parse successful responses
        const product = await productsResponse.json();
        const categories = await categoriesResponse.json();

        setProducts(product.products || []);
        setCategories(categories.categories || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [API_URL]);

  return (
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
      <Box padding="4" display="flex" justifyContent="space-around" alignItems="center">
        <Input placeholder="Search products..." size="lg" />
        <Dialog.Root>
          <Dialog.Trigger asChild>
            <Button variant="solid" colorPalette="teal" ml={4}>
              Add Product
            </Button>
          </Dialog.Trigger>
          <Portal>
            <Dialog.Backdrop />
            <Dialog.Positioner>
              <Dialog.Content>
                <Dialog.Header>
                  <Dialog.Title textStyle="3xl">Add New Product</Dialog.Title>
                  <Dialog.CloseTrigger asChild>
                    <CloseButton size="md" />
                  </Dialog.CloseTrigger>
                </Dialog.Header>
                <Dialog.Body>
                  <form onSubmit={handleSubmit}>
                    <Field.Root required mb="4">
                      <Field.Label mb="2">
                        Product Name
                        <Field.RequiredIndicator />
                      </Field.Label>
                      <Input
                        name="name"
                        value={newProduct.name}
                        onChange={(e) =>
                          setNewProduct((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        placeholder="Enter product name"
                      />
                    </Field.Root>

                    <Field.Root required mb="4">
                      <Field.Label mb="2">
                        Description
                        <Field.RequiredIndicator />
                      </Field.Label>
                      <Input
                        name="description"
                        value={newProduct.description}
                        onChange={(e) =>
                          setNewProduct((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        placeholder="Enter product description"
                      />
                    </Field.Root>

                    <Field.Root required mb="4">
                      <Field.Label mb="2">
                        Price
                        <Field.RequiredIndicator />
                      </Field.Label>
                      <Input
                        name="price"
                        type="number"
                        value={newProduct.price}
                        onChange={(e) =>
                          setNewProduct((prev) => ({
                            ...prev,
                            price: e.target.value,
                          }))
                        }
                        placeholder="Enter price"
                      />
                    </Field.Root>

                    <Field.Root required>
                      <Field.Label>
                        Category
                        <Field.RequiredIndicator />
                      </Field.Label>
                      <NativeSelect.Root>
                        <NativeSelect.Field
                          placeholder="Select category"
                          mb="4"
                          onChange={(e) => setNewProduct((prev) => ({ ...prev, category_id: e.target.value }))}
                        >
                          {categoryCollection.items.map((category) => (
                            <option value={category.value} key={category.value}>
                              {category.label}
                            </option>
                          ))}
                        </NativeSelect.Field>
                      </NativeSelect.Root>
                    </Field.Root>

                    <Field.Root required mb="4">
                      <Field.Label mb="2">
                        Stock
                        <Field.RequiredIndicator />
                      </Field.Label>
                      <Input
                        name="stock"
                        type="number"
                        value={newProduct.stock}
                        onChange={(e) =>
                          setNewProduct((prev) => ({
                            ...prev,
                            stock: e.target.value,
                          }))
                        }
                        placeholder="Enter stock quantity"
                      />
                    </Field.Root>

                    <Field.Root required mb="4">
                      <Field.Label mb="2">Image URL</Field.Label>
                      <Input
                        name="imageUrl"
                        value={newProduct.imageUrl}
                        onChange={(e) =>
                          setNewProduct((prev) => ({
                            ...prev,
                            imageUrl: e.target.value,
                          }))
                        }
                        placeholder="Enter image URL"
                      />
                    </Field.Root>
                  </form>
                </Dialog.Body>
                <Dialog.Footer>
                  <Button variant="solid" colorPalette="teal" onClick={handleSubmit}>
                    Create Product
                  </Button>
                </Dialog.Footer>
              </Dialog.Content>
            </Dialog.Positioner>
          </Portal>
        </Dialog.Root>
      </Box>
      <>
        {isLoading ? (
          <p>Loading...</p>
        ) : products.length > 0 ? (
          <Flex justifyContent="space-evenly" alignItems="start" gap={2} wrap="wrap">
            {products.map((product) => (
              <Box key={product.id} margin="4" maxW={500} height={600} borderRadius="lg">
                <Card.Root overflow="hidden">
                  <Image
                    src={product.imageUrl || "https://fakeimg.pl/400x300/000000/5cf2ca?text=Product+Image&font=bebas"}
                    alt={product.name}
                  />
                  <Card.Body gap="2">
                    <Card.Title textStyle="3xl">{product.name}</Card.Title>
                    <Card.Description textStyle="sm">{product.description}</Card.Description>
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
            ))}
          </Flex>
        ) : (
          <p>No products found.</p>
        )}
      </>
    </div>
  );
};

export default ProductPage;
