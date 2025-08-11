import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  SimpleGrid,
  GridItem,
} from "@chakra-ui/react";
import TokenManager from "../../utils/tokenManager";

const ProductPage = () => {
  interface User {
    id: number;
    first_name: string;
    last_name: string;
    user_name: string;
    email: string;
    role: string;
    seller_id?: number;
  }

  interface Category {
    category_id: number;
    name: string;
    description: string;
  }

  interface Product {
    product_id: number;
    name: string;
    description: string;
    price: number;
    category_id: number;
    seller_id: number;
    stock: number;
    image_url?: string;
  }

  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    category_id: "",
    stock: "",
    image_url: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Check authentication
      if (!TokenManager.isAuthenticated()) {
        navigate('/login');
        return;
      }

      // Validate form
      if (!newProduct.name || !newProduct.description || !newProduct.price || 
          !newProduct.category_id || !newProduct.stock) {
        toaster.create({
          type: "error",
          title: "Validation Error",
          description: "Please fill in all required fields",
        });
        return;
      }

      const productData = {
        ...newProduct,
        price: parseFloat(newProduct.price),
        stock: parseInt(newProduct.stock),
        category_id: parseInt(newProduct.category_id),
        seller_id: user?.seller_id || user?.id,
      };

      // Updated: Use JWT token instead of credentials
      const response = await fetch(`${API_URL}/products/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...TokenManager.getAuthHeader(),
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        // Handle 401 unauthorized
        if (response.status === 401) {
          TokenManager.removeToken();
          navigate('/login');
          return;
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to create product");
      }

      toaster.create({
        type: "success",
        title: "Success",
        description: "Product created successfully",
      });

      // Reset form
      setNewProduct({
        name: "",
        description: "",
        price: "",
        category_id: "",
        stock: "",
        image_url: "",
      });
      
      setIsDialogOpen(false);
      
      // Refresh products list
      fetchProducts();
    } catch (error: Error | unknown) {
      toaster.create({
        type: "error",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create product",
      });
    }
  };

  const deleteProduct = async (productId: number) => {
    try {
      if (!TokenManager.isAuthenticated()) {
        navigate('/login');
        return;
      }

      const response = await fetch(`${API_URL}/products/${productId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...TokenManager.getAuthHeader(),
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          TokenManager.removeToken();
          navigate('/login');
          return;
        }
        throw new Error("Failed to delete product");
      }

      toaster.create({
        type: "success",
        title: "Success",
        description: "Product deleted successfully",
      });

      // Refresh products list
      fetchProducts();
    } catch (error) {
      toaster.create({
        type: "error",
        title: "Error",
        description: "Failed to delete product",
      });
    }
  };

  // Check authentication and get user data
  useEffect(() => {
    if (!TokenManager.isAuthenticated()) {
      toaster.create({
        type: "error",
        title: "Login Required",
        description: "You must be logged in to view this page.",
      });
      navigate('/login');
      return;
    }

    const userData = TokenManager.getUser();
    if (!userData) {
      toaster.create({
        type: "error",
        title: "User Not Found",
        description: "No user data found.",
      });
      navigate('/login');
      return;
    }

    if (userData.role !== 'seller') {
      toaster.create({
        type: "error",
        title: "Access Denied",
        description: "You must be a seller to access this page.",
      });
      navigate('/market');
      return;
    }

    setUser(userData);
  }, [navigate]);

  const fetchProducts = async () => {
    try {
      if (!TokenManager.isAuthenticated()) {
        navigate('/login');
        return;
      }

      // Updated: Use JWT token instead of credentials
      const response = await fetch(`${API_URL}/products`, {
        headers: {
          "Content-Type": "application/json",
          ...TokenManager.getAuthHeader(),
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          TokenManager.removeToken();
          navigate('/login');
          return;
        }
        throw new Error("Failed to fetch products");
      }

      const data = await response.json();
      // Filter products to show only current seller's products
      const sellerProducts = data.products?.filter((product: Product) => 
        product.seller_id === user?.seller_id || product.seller_id === user?.id
      ) || [];
      setProducts(sellerProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
      toaster.create({
        type: "error",
        title: "Error",
        description: "Failed to fetch products",
      });
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/categories`, {
        headers: {
          "Content-Type": "application/json",
          ...TokenManager.getAuthHeader(),
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }

      const data = await response.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toaster.create({
        type: "error",
        title: "Error",
        description: "Failed to fetch categories",
      });
    }
  };

  const categoryCollection = createListCollection({
    items: categories.map((category) => ({
      label: category.name,
      value: category.category_id.toString(),
    })),
  });

  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        setIsLoading(true);
        await Promise.all([fetchProducts(), fetchCategories()]);
        setIsLoading(false);
      };
      fetchData();
    }
  }, [user, API_URL]);

  // Filter products based on search term
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user || user.role !== "seller") {
    return (
      <div>
        <Box textAlign="center" mt="10">
          <Text textStyle="4xl" color="red.500" fontWeight="bold">
            Access Denied!
          </Text>
          <Text textStyle="xl" color="gray.600" mt="4">
            You must be logged in as a seller to view this page.
          </Text>
          <Button mt="4" colorScheme="blue" onClick={() => navigate('/login')}>
            Go to Login
          </Button>
        </Box>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
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
        <Text color="gray.600" mt="2">
          Welcome, {user.first_name}! Manage your product inventory here.
        </Text>
      </Box>
      
      <SimpleGrid columns={{ xl: 10 }} gap={10} padding="4" m="4">
        <GridItem colSpan={{ xl: 9 }}>
          <Input 
            placeholder="Search your products..." 
            size="lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </GridItem>
        <GridItem colSpan={{ xl: 1 }}>
          <Dialog.Root open={isDialogOpen} onOpenChange={(e) => setIsDialogOpen(e.open)}>
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
                          Price ($)
                          <Field.RequiredIndicator />
                        </Field.Label>
                        <Input
                          name="price"
                          type="number"
                          step="0.01"
                          min="0"
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

                      <Field.Root required mb="4">
                        <Field.Label>
                          Category
                          <Field.RequiredIndicator />
                        </Field.Label>
                        <NativeSelect.Root>
                          <NativeSelect.Field
                            placeholder="Select category"
                            value={newProduct.category_id}
                            onChange={(e) => setNewProduct((prev) => ({ ...prev, category_id: e.target.value }))}
                          >
                            <option value="">Select a category</option>
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
                          Stock Quantity
                          <Field.RequiredIndicator />
                        </Field.Label>
                        <Input
                          name="stock"
                          type="number"
                          min="0"
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

                      <Field.Root mb="4">
                        <Field.Label mb="2">Image URL (Optional)</Field.Label>
                        <Input
                          name="image_url"
                          value={newProduct.image_url}
                          onChange={(e) =>
                            setNewProduct((prev) => ({
                              ...prev,
                              image_url: e.target.value,
                            }))
                          }
                          placeholder="Enter image URL"
                        />
                      </Field.Root>
                    </form>
                  </Dialog.Body>
                  <Dialog.Footer>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsDialogOpen(false)}
                      mr="2"
                    >
                      Cancel
                    </Button>
                    <Button variant="solid" colorPalette="teal" onClick={handleSubmit}>
                      Create Product
                    </Button>
                  </Dialog.Footer>
                </Dialog.Content>
              </Dialog.Positioner>
            </Portal>
          </Dialog.Root>
        </GridItem>
      </SimpleGrid>
      
      <>
        {isLoading ? (
          <Box textAlign="center" p="8">
            <Text>Loading your products...</Text>
          </Box>
        ) : filteredProducts.length > 0 ? (
          <>
            <Text color="gray.600" mb="4">
              Showing {filteredProducts.length} of {products.length} products
            </Text>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} gap={4} padding="4">
              {filteredProducts.map((product) => (
                <Box key={product.product_id} margin="4" maxW={500} height={600} borderRadius="lg">
                  <Card.Root overflow="hidden">
                    <Image
                      src={
                        product.image_url || "https://fakeimg.pl/400x300/000000/5cf2ca?text=Product+Image&font=bebas"
                      }
                      alt={product.name}
                      height="200px"
                      objectFit="cover"
                    />
                    <Card.Body gap="2">
                      <Card.Title textStyle="3xl">{product.name}</Card.Title>
                      <Card.Description textStyle="sm">{product.description}</Card.Description>
                      <Text textStyle="2xl" fontWeight="medium" letterSpacing="tight" mt="2">
                        ${product.price.toFixed(2)}
                      </Text>
                      <Text color={product.stock > 0 ? "green.500" : "red.500"}>
                        Stock: {product.stock} {product.stock === 0 && "(Out of Stock)"}
                      </Text>
                    </Card.Body>
                    <Card.Footer gap="2">
                      <Button variant="solid" colorPalette="blue" flex="1">
                        Edit
                      </Button>
                      <Button 
                        variant="solid" 
                        colorPalette="red" 
                        flex="1"
                        onClick={() => deleteProduct(product.product_id)}
                      >
                        Delete
                      </Button>
                    </Card.Footer>
                  </Card.Root>
                </Box>
              ))}
            </SimpleGrid>
          </>
        ) : (
          <Box textAlign="center" p="8">
            <Text fontSize="lg" color="gray.600">
              {searchTerm ? "No products found matching your search." : "No products found. Create your first product!"}
            </Text>
            {searchTerm && (
              <Button mt="4" onClick={() => setSearchTerm("")}>
                Clear Search
              </Button>
            )}
          </Box>
        )}
      </>
    </div>
  );
};

export default ProductPage