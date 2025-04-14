import { Box, Button, Container, Heading, Stack, Text, Grid, Icon } from "@chakra-ui/react";
import { AuthBackground } from "@/components/ui/auth-background";
import { Link } from "react-router-dom";
import { FiShoppingBag, FiTruck, FiUsers, FiShield } from "react-icons/fi";
import { IconType } from 'react-icons';

const Feature = ({ title, text, icon }: { title: string; text: string; icon: IconType }) => {
  return (
    <Stack
      align="center"
      textAlign="center"
      p={8}
      rounded="lg"
      bg="whiteAlpha.100"
      _hover={{
        transform: "translateY(-5px)",
        bg: "whiteAlpha.200",
      }}
      transition="all 0.3s"
    >
      <Icon as={icon} w={10} h={10} color="teal.400" mb={4} />
      <Text fontWeight="bold" fontSize="xl" color="white">
        {title}
      </Text>
      <Text color="gray.400">{text}</Text>
    </Stack>
  );
};

const LandingPage = () => {
  return (
    <Box minH="100vh" position="relative">
      <AuthBackground />

      {/* Hero Section */}
      <Box pt="20vh" pb={20}>
        <Container maxW="container.xl">
          <Stack gap={8} alignItems="center" textAlign="center">
            <Heading
              as="h1"
              size="5xl"
              color="white"
              fontWeight="bold"
              lineHeight="shorter"
            >
              Your Ultimate Shopping Experience
            </Heading>
            <Text fontSize="xl" color="gray.400" maxW="2xl">
              Join Emporia today and discover a world of endless possibilities. 
              Shop with confidence, sell with ease, and be part of our growing community.
            </Text>
            <Stack direction={{ base: "column", sm: "row" }} gap={4}>
              <Link to="/register">
                <Button
                  size="lg"
                  colorScheme="teal"
                  px={8}
                  _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}
                >
                  Start Shopping
                </Button>
              </Link>
              <Link to="/register">
                <Button
                  size="lg"
                  variant="outline"
                  color="white"
                  _hover={{
                    bg: "whiteAlpha.200",
                    transform: "translateY(-2px)",
                    boxShadow: "lg",
                  }}
                >
                  Become a Seller
                </Button>
              </Link>
            </Stack>
          </Stack>
        </Container>
      </Box>

      {/* Features Section */}
      <Box py={20}>
        <Container maxW="container.xl">
          <Grid
            templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }}
            gap={8}
          >
            <Feature
              icon={FiShoppingBag}
              title="Wide Selection"
              text="Browse through thousands of products from trusted sellers"
            />
            <Feature
              icon={FiTruck}
              title="Fast Delivery"
              text="Get your orders delivered quickly and securely"
            />
            <Feature
              icon={FiUsers}
              title="Community"
              text="Join a thriving community of buyers and sellers"
            />
            <Feature
              icon={FiShield}
              title="Secure Shopping"
              text="Shop with confidence with our secure payment system"
            />
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;