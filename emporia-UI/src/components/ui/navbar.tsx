import {Box, Button} from "@chakra-ui/react";



export const Navbar = () => {
  return (
    <Box bg="white" w="100%" p={4} color="black" position="fixed" zIndex={1}>
      <Box display="flex" justifyContent="space-between" alignItems="center"> 
        <h1>Emporia</h1>
        <div>
        <Button>Login</Button>
        <Button>Register</Button>
        </div>
      </Box>
    </Box>
  )

}