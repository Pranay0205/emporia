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
  Link,
} from "@chakra-ui/react";
import { PasswordInput } from "@/components/ui/password-input";
import { useForm } from "react-hook-form";
import { Link as RouterLink } from "react-router-dom";

interface FormValues {
  username: string;
  password: string;
}

const LoginPage = () => {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>();

  const onSubmit = handleSubmit((data) => {
    setIsLoading(true);
    // Simulate API call
    console.log(data);
    setTimeout(() => {
      setIsLoading(false);
      // Here you would handle the login response
    }, 1000);
  });

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      minH="100vh"
      px="4"
    >
      <Box maxW="400px" w="100%" p="6" boxShadow="lg" rounded="md" bg="black">
        {/* Logo Section */}
        <Box mb="8" textAlign="center">
          <Heading as="h1" size="xl" fontWeight="bold" letterSpacing="wide">
            EMPORIA
          </Heading>
          <Text mt="2" fontSize="md" color="gray.400">
            Your One-Stop Shopping Platform
          </Text>
        </Box>
        <Heading size="lg" mb="6" textAlign="center">
          Login to Your Account
        </Heading>

        <form onSubmit={onSubmit}>
          <Stack gap="4" align="stretch">
            <Field.Root invalid={!!errors.username}>
              <Field.Label>Username</Field.Label>
              <Input
                {...register("username", {
                  required: "Username is required",
                })}
              />
              <Field.ErrorText>{errors.username?.message}</Field.ErrorText>
            </Field.Root>

            <Field.Root invalid={!!errors.password}>
              <Field.Label>Password</Field.Label>
              <PasswordInput
                {...register("password", {
                  required: "Password is required",
                })}
              />
              <Field.ErrorText>{errors.password?.message}</Field.ErrorText>
            </Field.Root>

            <Button
              type="submit"
              width="full"
              colorScheme="blue"
              mt="4"
              loading={isLoading}
              loadingText="Logging in"
            >
              Login
            </Button>
          </Stack>
        </form>

        <Box mt="4" textAlign="center">
          <Text fontSize="sm">
            Don't have an account?{" "}
            <RouterLink to="/register" color="blue.500">
              Register here
            </RouterLink>
          </Text>
        </Box>
      </Box>
    </Box>
  );
};

export default LoginPage;
