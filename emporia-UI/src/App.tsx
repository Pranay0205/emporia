import React from "react";
import "./App.css";
import { Button, HStack } from "@chakra-ui/react";

function App() {
  return (
    <>
      <h1 className="text-3xl font-bold bg-green-700">One Piece is real</h1>

      <HStack>
        <Button>Click me</Button>
        <Button>Click me</Button>
      </HStack>
    </>
  );
}

export default App;
