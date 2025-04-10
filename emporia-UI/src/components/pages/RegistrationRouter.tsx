"use client";

import { useState } from "react";
import {
  Button,
  Field,
  Input,
  Stack,
  Box,
  Heading,
  Text,
  Textarea,
} from "@chakra-ui/react";
import {
  PasswordInput,
  PasswordStrengthMeter,
} from "@/components/ui/password-input";
import { useForm } from "react-hook-form";

// Common form fields for all user types
interface BaseFormValues {
  first_name: string;
  last_name: string;
  user_name: string;
  email: string;
  password: string;
  role: "customer" | "seller";
}

interface FormValues {
  first_name: string;
  last_name: string;
  user_name: string;
  email: string;
  password: string;
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

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>();

  const password = watch("password");

  const onSubmit = handleSubmit((data) => {
    // Add role to the data
    const formData = { ...data, role: userRole };
    console.log(formData);
    // Here you would send the data to your API
  });

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      minH="100vh"
      px="4"
    >
      <Box maxW="500px" w="100%" p="6" boxShadow="lg" rounded="md" bg="black">
        <Heading size="lg" mb="6" textAlign="center">
          Create an Account
        </Heading>

        <Box mb="6">
          <Text mb="2" fontWeight="medium">
            Register as:
          </Text>
          <Stack direction="row" gap="4">
            <Button
              colorScheme={userRole === "customer" ? "blue" : "gray"}
              variant={userRole === "customer" ? "solid" : "outline"}
              flex="1"
              onClick={() => setUserRole("customer")}
            >
              Customer
            </Button>
            <Button
              colorScheme={userRole === "seller" ? "blue" : "gray"}
              variant={userRole === "seller" ? "solid" : "outline"}
              flex="1"
              onClick={() => setUserRole("seller")}
            >
              Seller
            </Button>
          </Stack>
        </Box>

        <form onSubmit={onSubmit}>
          <Stack gap="4" align="stretch">
            {/* Common Fields for Both User Types */}
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

            <Field.Root invalid={!!errors.user_name}>
              <Field.Label>Username</Field.Label>
              <Input
                {...register("user_name", {
                  required: "Username is required",
                  pattern: {
                    value: /^[A-Za-z0-9_]+$/,
                    message:
                      "Username can only contain letters, numbers, and underscores",
                  },
                })}
              />
              <Field.ErrorText>{errors.user_name?.message}</Field.ErrorText>
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
              <PasswordStrengthMeter
                width="100%"
                value={calculatePasswordStrength(password || "")}
              />
              <Field.ErrorText>{errors.password?.message}</Field.ErrorText>
            </Field.Root>

            {/* Conditional Fields Based on User Role */}
            {userRole === "customer" && (
              <>
                <Field.Root invalid={!!errors.address}>
                  <Field.Label>Address</Field.Label>
                  <Input
                    {...register("address", {
                      required: "Address is required for customers",
                    })}
                  />
                  <Field.ErrorText>{errors.address?.message}</Field.ErrorText>
                </Field.Root>

                <Field.Root invalid={!!errors.phone_number}>
                  <Field.Label>Phone Number</Field.Label>
                  <Input
                    {...register("phone_number", {
                      required: "Phone number is required for customers",
                    })}
                  />
                  <Field.ErrorText>
                    {errors.phone_number?.message}
                  </Field.ErrorText>
                </Field.Root>
              </>
            )}

            {userRole === "seller" && (
              <>
                <Field.Root invalid={!!errors.store_name}>
                  <Field.Label>Store Name</Field.Label>
                  <Input
                    {...register("store_name", {
                      required: "Store name is required for sellers",
                    })}
                  />
                  <Field.ErrorText>
                    {errors.store_name?.message}
                  </Field.ErrorText>
                </Field.Root>

                <Field.Root invalid={!!errors.store_desc}>
                  <Field.Label>Store Description</Field.Label>
                  <Textarea
                    {...register("store_desc", {
                      required: "Store description is required for sellers",
                    })}
                  />
                  <Field.ErrorText>
                    {errors.store_desc?.message}
                  </Field.ErrorText>
                </Field.Root>
              </>
            )}

            <Button type="submit" width="full" colorScheme="blue" mt="4">
              Register
            </Button>
          </Stack>
        </form>
      </Box>
    </Box>
  );
};

export default RegistrationRouter;
