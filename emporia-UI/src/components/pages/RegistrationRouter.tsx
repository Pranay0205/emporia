"use client";

import { useState } from "react";
import { Button, Field, Input, Stack, Box, Heading, Text, Textarea, Flex, HStack } from "@chakra-ui/react";
import { PasswordInput, PasswordStrengthMeter } from "@/components/ui/password-input";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { AuthBackground } from "@/components/ui/auth-background";
import { toaster } from "@/components/ui/toaster";

// Common form fields for all user types
interface FormValues {
  first_name: string;
  last_name: string;
  user_name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: "customer" | "seller";
  // Customer fields
  address?: string;
  phone_number?: string;
  // Seller fields
  store_name?: string;
  store_desc?: string;
}

const calculatePasswordStrength = (password: string) => {
  if (!password || password.length < 8) return 0;

  let strength = 0;
  const hasMinLength = password.length >= 8;
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  if (hasMinLength) strength += 1;
  if (hasLower && hasUpper) strength += 1; // Mixed case
  if (hasNumber) strength += 1; // Numbers
  if (hasSpecial) strength += 1; // Special characters

  return Math.min(strength, 4); // Cap at 4 levels
};

const RegistrationRouter = () => {
  const [userRole, setUserRole] = useState<"customer" | "seller">("customer");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>();

  const password = watch("password");
  const confirmPassword = watch("confirmPassword");

  const onSubmit = handleSubmit(async (data) => {
    try {
      setIsLoading(true);

      // Format the data according to your API requirements
      const formData = {
        first_name: data.first_name,
        last_name: data.last_name,
        user_name: data.user_name,
        email: data.email,
        password: data.password,
        role: userRole,
        // For customer specific fields
        ...(userRole === "customer" && {
          address: data.address,
          phone_number: data.phone_number,
          customer_id: 1, // This might need to be generated or handled by your backend
        }),
        // For seller specific fields
        ...(userRole === "seller" && {
          store_name: data.store_name,
          store_desc: data.store_desc,
          seller_id: 1, // This might need to be generated or handled by your backend
        }),
        id: Math.floor(Math.random() * 1000), // Generate a random ID for testing, your backend should handle this
      };

      console.log("Submitting registration data:", formData);

      // Make API call to register endpoint
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      console.log("Response status:", response.status);
      const responseData = await response.json();
      console.log("Response data:", responseData);

      if (!response.ok) {
        throw new Error(responseData.message || "Registration failed");
      }

      toaster.create({
        type: "success",
        title: "Registration Successful",
        description: "You have successfully registered. Please log in to continue.",
      });
      // Redirect to login page after successful registration
      window.location.href = "/login";
    } catch (error) {
      console.error("Registration error:", error);
      toaster.create({
        type: "error",
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "Registration failed. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  });

  return (
    <Box display="flex" alignItems="center" justifyContent="center" minH="100vh" px="4" my="24">
      <AuthBackground />
      <Box maxW="800px" w="100%" p="6" boxShadow="lg" rounded="md" bg="gray.950">
        {/* Logo Section */}
        <Box mb="4" textAlign="center">
          <Heading as="h1" size="xl" fontWeight="bold" letterSpacing="wide">
            <Link to="/">EMPORIA</Link>
          </Heading>
          <Text mt="2" fontSize="md" color="gray.400">
            Your One-Stop Shopping Platform
          </Text>
        </Box>
        <Heading size="lg" mb="2" textAlign="center">
          Create an Account
        </Heading>

        {/* Role Selection */}
        <Box mb="8">
          <Text mb="4" fontWeight="medium" color="white" textAlign="center">
            Register As
          </Text>
          <HStack justify="center" gap="2" maxW="400px" mx="auto">
            <Button
              colorScheme="teal"
              variant={userRole === "customer" ? "solid" : "outline"}
              size="lg"
              w="150px"
              onClick={() => setUserRole("customer")}
              _hover={{
                transform: "translateY(-2px)",
                boxShadow: "lg",
                bg: userRole === "customer" ? "teal.600" : "whiteAlpha.200",
              }}
              transition="all 0.2s"
              borderWidth={2}
            >
              Customer
            </Button>
            <Button
              colorScheme="teal"
              variant={userRole === "seller" ? "solid" : "outline"}
              size="lg"
              w="150px"
              onClick={() => setUserRole("seller")}
              _hover={{
                transform: "translateY(-2px)",
                boxShadow: "lg",
                bg: userRole === "seller" ? "teal.600" : "whiteAlpha.200",
              }}
              transition="all 0.2s"
              borderWidth={2}
            >
              Seller
            </Button>
          </HStack>
          <Flex align="center" my="6">
            <Box flex="1" h="1px" bg="gray.600" />
          </Flex>
        </Box>

        <form onSubmit={onSubmit}>
          <Stack direction={{ base: "column", md: "row" }} gap="6" align="flex-start">
            {/* Left Column */}
            <Box flex="1" w="100%">
              <Stack gap="4">
                <Field.Root invalid={!!errors.first_name}>
                  <Field.Label>First Name</Field.Label>
                  <Input
                    {...register("first_name", {
                      required: "First name is required",
                      pattern: {
                        value: /^[A-Za-z]+$/,
                        message: "First name can only contain letters",
                      },
                    })}
                  />
                  <Field.ErrorText>{errors.first_name?.message}</Field.ErrorText>
                </Field.Root>

                <Field.Root invalid={!!errors.user_name}>
                  <Field.Label>Username</Field.Label>
                  <Input
                    {...register("user_name", {
                      required: "Username is required",
                      pattern: {
                        value: /^[A-Za-z0-9_]+$/,
                        message: "Username can only contain letters, numbers, and underscores",
                      },
                    })}
                  />
                  <Field.ErrorText>{errors.user_name?.message}</Field.ErrorText>
                </Field.Root>

                <Field.Root invalid={!!errors.password}>
                  <Field.Label>Password</Field.Label>
                  <PasswordInput
                    {...register("password", {
                      required: "Password is required",
                      minLength: {
                        value: 8,
                        message: "Password must be at least 8 characters",
                      },
                    })}
                  />
                  <PasswordStrengthMeter width="100%" value={calculatePasswordStrength(password || "")} />
                  <Field.ErrorText>{errors.password?.message}</Field.ErrorText>
                </Field.Root>

                <Field.Root invalid={!!errors.confirmPassword}>
                  <Field.Label>Confirm Password</Field.Label>
                  <PasswordInput
                    {...register("confirmPassword", {
                      required: "Please confirm your password",
                      validate: (value) => value === password || "Passwords do not match",
                    })}
                  />
                  <Field.ErrorText>{errors.confirmPassword?.message}</Field.ErrorText>
                </Field.Root>

                {userRole === "customer" && (
                  <Field.Root invalid={!!errors.phone_number}>
                    <Field.Label>Phone Number</Field.Label>
                    <Input
                      {...register("phone_number", {
                        required: "Phone number is required for customers",
                      })}
                    />
                    <Field.ErrorText>{errors.phone_number?.message}</Field.ErrorText>
                  </Field.Root>
                )}

                {userRole === "seller" && (
                  <Field.Root invalid={!!errors.store_name}>
                    <Field.Label>Store Name</Field.Label>
                    <Input
                      {...register("store_name", {
                        required: "Store name is required for sellers",
                      })}
                    />
                    <Field.ErrorText>{errors.store_name?.message}</Field.ErrorText>
                  </Field.Root>
                )}
              </Stack>
            </Box>

            {/* Right Column */}
            <Box flex="1" w="100%">
              <Stack gap="4">
                <Field.Root invalid={!!errors.last_name}>
                  <Field.Label>Last Name</Field.Label>
                  <Input
                    {...register("last_name", {
                      required: "Last name is required",
                      pattern: {
                        value: /^[A-Za-z]+$/,
                        message: "Last name can only contain letters",
                      },
                    })}
                  />
                  <Field.ErrorText>{errors.last_name?.message}</Field.ErrorText>
                </Field.Root>

                <Field.Root invalid={!!errors.email}>
                  <Field.Label>Email</Field.Label>
                  <Input
                    type="email"
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[^@]+@[^@]+\.[^@]+$/,
                        message: "Invalid email format",
                      },
                    })}
                  />
                  <Field.ErrorText>{errors.email?.message}</Field.ErrorText>
                </Field.Root>

                {userRole === "customer" && (
                  <Field.Root invalid={!!errors.address}>
                    <Field.Label>Address</Field.Label>
                    <Input
                      {...register("address", {
                        required: "Address is required for customers",
                      })}
                    />
                    <Field.ErrorText>{errors.address?.message}</Field.ErrorText>
                  </Field.Root>
                )}

                {userRole === "seller" && (
                  <Field.Root invalid={!!errors.store_desc}>
                    <Field.Label>Store Description</Field.Label>
                    <Textarea
                      {...register("store_desc", {
                        required: "Store description is required for sellers",
                      })}
                    />
                    <Field.ErrorText>{errors.store_desc?.message}</Field.ErrorText>
                  </Field.Root>
                )}
              </Stack>
            </Box>
          </Stack>

          <Button type="submit" width="full" colorScheme="teal" mt="8" size="lg">
            Register
          </Button>
        </form>

        <Box mt="6" textAlign="center">
          <Text fontSize="sm" color="gray.300">
            Already have an account?{" "}
            <Link to="/login">
              <Text as="span" color="teal.500" fontWeight="bold" _hover={{ color: "teal.300" }}>
                Login here
              </Text>
            </Link>
          </Text>
        </Box>
      </Box>
    </Box>
  );
};

export default RegistrationRouter;
