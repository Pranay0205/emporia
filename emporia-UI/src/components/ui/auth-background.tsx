import { Box } from "@chakra-ui/react";
import { keyframes } from "@emotion/react";

const gradientAnimation = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;

export const AuthBackground = () => {
  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      right={0}
      bottom={0}
      zIndex={-1}
      background="linear-gradient(-45deg, #1a1a1a, #2d3748, #4a5568, #2d3748)"
      backgroundSize="400% 400%"
      animation={`${gradientAnimation} 15s ease infinite`}
      _before={{
        content: '""',
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.7) 100%)",
      }}
    >
      {/* Decorative elements */}
      <Box
        position="absolute"
        top="20%"
        left="10%"
        w="200px"
        h="200px"
        borderRadius="50%"
        bg="rgba(255,255,255,0.05)"
        filter="blur(40px)"
      />
      <Box
        position="absolute"
        bottom="20%"
        right="10%"
        w="300px"
        h="300px"
        borderRadius="50%"
        bg="rgba(255,255,255,0.05)"
        filter="blur(40px)"
      />
    </Box>
  );
}; 