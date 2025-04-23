import { useEffect, useState } from "react";
import { toaster } from "@/components/ui/toaster";
import { Box, Button, Input, Stack, Table } from "@chakra-ui/react";

const CategoriesPage = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState({ id: 0, name: "", description: "" });
  const [isLoading, setIsLoading] = useState(true);

  interface Category {
    id: number;
    name: string;
    description: string;
  }

  useEffect(() => {
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

    fetchCategories();
  }, [API_URL]);

  const handleAddCategory = async () => {
    try {
      const response = await fetch(`${API_URL}/categories/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCategory),
      });

      if (!response.ok) {
        const errorData = await response.json();
        toaster.create({
          title: "Failed to add category",
          description: errorData.message || "An error occurred while adding the category.",
          meta: { pauseOnHover: true, closable: true },
          type: "error",
        });
        throw new Error(errorData.message || "Failed to add category");
      }

      const addedCategory = await response.json();
      setCategories((prev) => [...prev, addedCategory.category]);
      setNewCategory({ id: 0, name: "", description: "" });
      toaster.create({
        title: "Category added",
        description: "The category was added successfully.",
        type: "success",
      });
    } catch (error) {
      console.log("Error adding category:", error);
      toaster.create({
        title: "Failed to add category",
        description: error || "An error occurred while adding the category.",
        meta: { pauseOnHover: true, closable: true },
        type: "error",
      });
      console.error("Error adding category:", error);
    }
  };

  const handleRemoveCategory = async (id: number) => {
    try {
      const response = await fetch(`${API_URL}/categories/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        toaster.create({
          title: "Failed to remove category",
          description: errorData.message || "An error occurred while removing the category.",
          meta: { pauseOnHover: true, closable: true },
          type: "error",
        });
        throw new Error(errorData.message || "Failed to remove category");
      }

      setCategories((prev) => prev.filter((category) => category.id !== id));
      toaster.create({
        title: "Category removed",
        description: "The category was removed successfully.",
        type: "success",
      });
    } catch (error) {
      console.error("Error removing category:", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <Box m="10">
          <Stack gap="5" maxW={"container.xl"} rounded="md">
            <Stack direction="row" gap="3" mb="5">
              <Input
                placeholder="Category Name"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
              />
              <Input
                placeholder="Category Description"
                value={newCategory.description}
                onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
              />
              <Button colorScheme="blue" onClick={handleAddCategory}>
                Add Category
              </Button>
            </Stack>
            <Table.Root size="lg" variant="outline">
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader>Category</Table.ColumnHeader>
                  <Table.ColumnHeader>Description</Table.ColumnHeader>
                  <Table.ColumnHeader textAlign="end">Actions</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {categories && categories.length > 0 ? (
                  categories.map((item, index) => (
                    <Table.Row key={item.id + index}>
                      <Table.Cell>{item.name}</Table.Cell>
                      <Table.Cell>{item.description}</Table.Cell>
                      <Table.Cell textAlign="end">
                        <Button color="red" size="sm" onClick={() => handleRemoveCategory(item.id)}>
                          Remove
                        </Button>
                      </Table.Cell>
                    </Table.Row>
                  ))
                ) : (
                  <Table.Row>
                    <Table.Cell colSpan={3} textAlign="center">
                      No categories available.
                    </Table.Cell>
                  </Table.Row>
                )}
              </Table.Body>
            </Table.Root>
          </Stack>
        </Box>
      )}
    </div>
  );
};

export default CategoriesPage;
