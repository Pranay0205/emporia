import React from "react";
import "./App.css";
import {
  Button,
  HStack,
  Card,
  Heading,
  Stack,
  Avatar,
  Image,
  Text,
} from "@chakra-ui/react";
import { LuArrowRight } from "react-icons/lu";

function App() {
  return (
    <>
      <Stack align="flex-start">
        <Heading size="2xl">ONE PIECE SHOP</Heading>
        <Text mb="3" fontSize="md" color="fg.muted">
          Ultimate Stop for Gold Roger's Treasure
        </Text>
        <Button>
          Create account <LuArrowRight />
        </Button>
      </Stack>

      <HStack>
        <Avatar.Root shape="rounded" size="lg">
          <Avatar.Fallback name="Segun Adebayo" />
          <Avatar.Image src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSF2UzUmH3TeaoGyNFHPI7hNI-c7ppGiYzPyQ&s" />
        </Avatar.Root>
      </HStack>

      <Stack gap="4" direction="row" wrap="wrap">
        <Card.Root maxW="sm" overflow="hidden">
          <Image
            src="https://katana-sword.com/cdn/shop/files/katana-enma2_1200x.jpg?v=1720072549"
            alt="Green double couch with wooden legs"
          />
          <Card.Body gap="2">
            <Card.Title>Sword Enma</Card.Title>
            <Card.Description>Cursed Sword of Shogun Oden</Card.Description>
            <Text
              textStyle="2xl"
              fontWeight="medium"
              letterSpacing="tight"
              mt="2"
            >
              $450,000,000
            </Text>
          </Card.Body>
          <Card.Footer gap="2">
            <Button variant="solid">Buy now</Button>
            <Button variant="ghost">Add to cart</Button>
          </Card.Footer>
        </Card.Root>
      </Stack>
    </>
  );
}

export default App;
