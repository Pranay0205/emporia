import { useState, useEffect } from "react";
import { FiEdit, FiTrash2, FiPlus } from "react-icons/fi";

// Modern Chakra UI v3 imports using namespaced pattern
import { Box, Button, Container, Heading, Icon, Input, Spinner, Stack, Table, Text, Textarea } from "@chakra-ui/react";
import { useToast } from "@chakra-ui/react";
// Use namespaced imports for components with sub-components
import { Alert } from "@chakra-ui/react";
import { Field } from "@chakra-ui/react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/modal";
import { useDisclosure } from "@chakra-ui/react";

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentCategory, setCurrentCategory] = useState({ name: "", description: "" });
  const [formErrors, setFormErrors] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  // Fetch all categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:5000/categories/");

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      setCategories(data.categories || []);
      setError(null);
    } catch (err) {
      setError(`Failed to fetch categories: ${err.message}`);
      console.error("Error fetching categories:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = () => {
    setCurrentCategory({ name: "", description: "" });
    setFormErrors({});
    setIsEditing(false);
    onOpen();
  };

  const handleEditCategory = (category) => {
    setCurrentCategory({ ...category });
    setFormErrors({});
    setIsEditing(true);
    onOpen();
  };

  const handleDeleteCategory = (category) => {
    setCurrentCategory({ ...category });
    setIsDeleting(true);
    onOpen();
  };

  const validateForm = () => {
    const errors = {};
    if (!currentCategory.name || currentCategory.name.trim() === "") {
      errors.name = "Category name is required";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const submitCategory = async () => {
    if (!validateForm()) return;

    try {
      const url = isEditing
        ? `http://localhost:5000/categories/${currentCategory.id}`
        : "http://localhost:5000/categories/";

      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: currentCategory.name,
          description: currentCategory.description || "",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save category");
      }

      onClose();
      fetchCategories();

      toast({
        title: isEditing ? "Category updated" : "Category created",
        description: isEditing
          ? `"${currentCategory.name}" has been updated successfully`
          : `"${currentCategory.name}" has been added successfully`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (err) {
      setError(err.message);
      toast({
        title: "Error",
        description: err.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const confirmDeleteCategory = async () => {
    try {
      const response = await fetch(`http://localhost:5000/categories/${currentCategory.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete category");
      }

      onClose();
      fetchCategories();

      toast({
        title: "Category deleted",
        description: `"${currentCategory.name}" has been deleted successfully`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (err) {
      setError(err.message);
      toast({
        title: "Error",
        description: err.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentCategory({
      ...currentCategory,
      [name]: value,
    });

    // Clear field-specific error when user types
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: undefined,
      });
    }
  };

  const handleModalClose = () => {
    setIsEditing(false);
    setIsDeleting(false);
    onClose();
  };

  return (
    <Container maxW="container.xl" py="24">
      <Box mb="8">
        <Heading size="xl" mb="4">
          Categories Management
        </Heading>
        <Button leftIcon={<Icon as={FiPlus} />} colorScheme="teal" onClick={handleAddCategory} mb="6">
          Add New Category
        </Button>
      </Box>

      {loading ? (
        <Box textAlign="center" py="10">
          <Spinner size="xl" color="teal.500" thickness="4px" />
          <Text mt="4">Loading categories...</Text>
        </Box>
      ) : error ? (
        <Alert status="error" variant="left-accent" borderRadius="md" mb="6">
          <Text fontWeight="bold" mr="2">
            Error!
          </Text>
          <Text>{error}</Text>
        </Alert>
      ) : categories.length === 0 ? (
        <Box textAlign="center" py="10" bg="gray.50" borderRadius="md">
          <Text fontSize="lg" color="gray.600">
            No categories found. Create your first category!
          </Text>
        </Box>
      ) : (
        <Box overflowX="auto" boxShadow="md" borderRadius="lg">
          <Table variant="simple">
            <Table.Head bg="gray.50">
              <Table.Tr>
                <Table.Th>ID</Table.Th>
                <Table.Th>Name</Table.Th>
                <Table.Th>Description</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Head>
            <Table.Tbody>
              {categories.map((category) => (
                <Table.Tr key={category.id}>
                  <Table.Td>{category.id}</Table.Td>
                  <Table.Td fontWeight="medium">{category.name}</Table.Td>
                  <Table.Td>{category.description || "-"}</Table.Td>
                  <Table.Td>
                    <Stack direction="row" spacing="2">
                      <Button
                        size="sm"
                        colorScheme="blue"
                        variant="ghost"
                        leftIcon={<Icon as={FiEdit} />}
                        onClick={() => handleEditCategory(category)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        colorScheme="red"
                        variant="ghost"
                        leftIcon={<Icon as={FiTrash2} />}
                        onClick={() => handleDeleteCategory(category)}
                      >
                        Delete
                      </Button>
                    </Stack>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Box>
      )}

      {/* Modal for Add/Edit/Delete Category */}
      <Modal isOpen={isOpen} onClose={handleModalClose}>
        <ModalOverlay />
        <ModalContent>
          {isDeleting ? (
            <>
              <ModalHeader>Delete Category</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                Are you sure you want to delete the category "{currentCategory.name}"?
                {currentCategory.id && (
                  <Text color="red.500" mt="2" fontSize="sm">
                    This action cannot be undone.
                  </Text>
                )}
              </ModalBody>
              <ModalFooter>
                <Button variant="ghost" mr={3} onClick={handleModalClose}>
                  Cancel
                </Button>
                <Button colorScheme="red" onClick={confirmDeleteCategory}>
                  Delete
                </Button>
              </ModalFooter>
            </>
          ) : (
            <>
              <ModalHeader>{isEditing ? "Edit Category" : "Add New Category"}</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <Field.Root isInvalid={formErrors.name} mb="4">
                  <Field.Label>Category Name</Field.Label>
                  <Input
                    name="name"
                    value={currentCategory.name}
                    onChange={handleInputChange}
                    placeholder="Enter category name"
                  />
                  <Field.ErrorText>{formErrors.name}</Field.ErrorText>
                </Field.Root>
                <Field.Root>
                  <Field.Label>Description</Field.Label>
                  <Textarea
                    name="description"
                    value={currentCategory.description || ""}
                    onChange={handleInputChange}
                    placeholder="Enter category description (optional)"
                    resize="vertical"
                    rows={3}
                  />
                </Field.Root>
              </ModalBody>
              <Modal.Footer>
                <Button variant="ghost" mr={3} onClick={handleModalClose}>
                  Cancel
                </Button>
                <Button colorScheme="teal" onClick={submitCategory}>
                  {isEditing ? "Update" : "Create"}
                </Button>
              </Modal.Footer>
            </>
          )}
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default CategoriesPage;
