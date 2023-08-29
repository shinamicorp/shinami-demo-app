import { Box, Button as ChakraButton } from "@chakra-ui/react";

export const Divider = () => (
  <Box
    height="1px"
    width="100%"
    bgGradient="linear-gradient(270deg, rgba(217, 217, 217, 0.00) 0%, #D9D9D9 54.17%, rgba(217, 217, 217, 0.00) 100%)"
  ></Box>
);

export const Button = ({ children, variant }: any) => (
  <ChakraButton variant={variant}>
    <span style={{ transform: "skew(20deg)" }}>{children}</span>
  </ChakraButton>
);
