"use client";
import { useState } from "react";
import { Button, Field, Input, Stack, Box, Heading, Text } from "@chakra-ui/react";
import { PasswordInput } from "@/components/ui/password-input";
import { useForm } from "react-hook-form";
import { Link as RouterLink, useNavigate, useLocation } from "react-router-dom";
import { AuthBackground } from "@/components/ui/auth-background";
import { toaster } from "../ui/toaster";
import TokenManager from "../../utils/tokenManager";

interface FormValues {
  username: string;
  password: string;
}

interface LoginPageProps {
  setIsAuth: (isAuth: boolean) => void;
}

const LoginPage = ({ setIsAuth }: LoginPageProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = location.state?.from?.pathname || "/market";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>();

  const onSubmit = handleSubmit(async (data) => {
    try {
      setIsLoading(true);
      
      // Make API call to login endpoint - REMOVED credentials: "include"
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: data.username,
          password: data.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Login failed");
      }

      const responseData = await response.json();
      console.log("Login successful:", responseData);

      // Store JWT token and user data using TokenManager
      TokenManager.setToken(responseData.access_token);
      TokenManager.setUser(responseData.user);
      
      // Update authentication state
      setIsAuth(true);
      
      toaster.create({
        type: "success",
        title: "Login Successful",
        description: "Welcome back! Redirecting to your dashboard...",
      });

      setTimeout(() => {
        navigate(from, { replace: true });
      }, 1000);
      
    } catch (error: any) {
      console.error("Login error:", error);
      toaster.create({
        type: "error",
        title: "Login Failed",
        description: error.message || "An error occurred during login.",
      });
    } finally {
      setIsLoading(false);
    }
  });

  return (
    <Box display="flex" alignItems="center" justifyContent="center" minH="100vh" px="4">
      <AuthBackground />
      <Box maxW="400px" w="100%" p="6" boxShadow="lg" rounded="md" bg="gray.950">
        {/* Logo Section */}
        <Box mb="8" textAlign="center">
          <Heading as="h1" size="xl" fontWeight="bold" letterSpacing="wide">
            <RouterLink to="/">EMPORIA</RouterLink>
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
              <Field.Label color="white">Username</Field.Label>
              <Input
                bg="whiteAlpha.100"
                borderColor="whiteAlpha.300"
                color="white"
                _hover={{ borderColor: "whiteAlpha.400" }}
                _focus={{ borderColor: "blue.400" }}
                {...register("username", {
                  required: "Username is required",
                })}
              />
              <Field.ErrorText>{errors.username?.message}</Field.ErrorText>
            </Field.Root>

            <Field.Root invalid={!!errors.password}>
              <Field.Label color="white">Password</Field.Label>
              <PasswordInput
                bg="whiteAlpha.100"
                borderColor="whiteAlpha.300"
                color="white"
                _hover={{ borderColor: "whiteAlpha.400" }}
                _focus={{ borderColor: "blue.400" }}
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
              size="lg"
              _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}
              transition="all 0.2s"
            >
              Login
            </Button>
          </Stack>
        </form>

        <Box mt="6" textAlign="center">
          <Text fontSize="sm" color="gray.300">
            Don't have an account?{" "}
            <RouterLink to="/register">
              <Text as="span" color="teal.500" fontWeight="bold" _hover={{ color: "blue.300" }}>
                Register here
              </Text>
            </RouterLink>
          </Text>
        </Box>
      </Box>
    </Box>
  );
};

export default LoginPage;