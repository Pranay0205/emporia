"use client";

import { Button, Field, Input, Stack, Box, Flex } from "@chakra-ui/react";
import {
  PasswordInput,
  PasswordStrengthMeter,
} from "@/components/ui/password-input";
import { useForm } from "react-hook-form";

interface FormValues {
  username: string;
  password: string;
}

const calculatePasswordStrength = (password: string) => {
  if (!password || password.length < 8) return 0;

  let strength = 0; // Minimum length met
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
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>();

  const password = watch("password");
  const onSubmit = handleSubmit((data) => console.log(data));

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      minH="100vh"
      px="4"
    >
      <form onSubmit={onSubmit}>
        <Stack gap="8" align="stretch" width="400px">
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
                minLength: { value: 8, message: "Minimum length is 8" },
              })}
            />

            <PasswordStrengthMeter
              width="400px"
              value={calculatePasswordStrength(password || "")}
            />
            <Field.ErrorText>{errors.password?.message}</Field.ErrorText>
          </Field.Root>

          <Button type="submit" width="full">
            Submit
          </Button>
        </Stack>
      </form>
    </Box>
  );
};

export default RegistrationRouter;
