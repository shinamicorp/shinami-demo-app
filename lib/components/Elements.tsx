import {
  Box,
  Button as ChakraButton,
  Flex,
  Heading,
  Image,
  VStack,
  Text,
} from "@chakra-ui/react";

export const Divider = () => (
  <Box
    height="1px"
    width="100%"
    bgGradient="linear-gradient(270deg, rgba(217, 217, 217, 0.00) 0%, #D9D9D9 54.17%, rgba(217, 217, 217, 0.00) 100%)"
  ></Box>
);

export const Button = ({ children, variant }: any) => (
  <ChakraButton variant={variant}>
    <span style={{ transform: "skew(10deg)" }}>{children}</span>
  </ChakraButton>
);

export const NewHeroCard = () => (
  <Flex
    flexDir="column"
    justify="end"
    align="center"
    width="220px"
    height="284px"
    background="rgba(63, 49, 55, 0.6)"
    border="5px #D4D4D4 dashed"
    borderRadius="20px"
    transform="skew(-10deg)"
    padding="20px"
    _hover={{
      background: "rgba(63, 49, 55, 0.8)",
      boxShadow: "lg",
      transform: "scale(1.02) skew(-10deg)",
    }}
    _active={{
      transform: "scale(1.0) skew(-10deg)",
    }}
    transition="all 0.3s ease"
  >
    <VStack gap="50px">
      <Image
        transform="skew(10deg)"
        boxSize="48px"
        src="/plus-icon.svg"
        alt="add hero icon"
      />
      <Heading transform="skew(10deg)">New hero</Heading>
    </VStack>
  </Flex>
);

interface HeroCardProps {
  name: string;
  character: number;
}

export const HeroCard = ({ name, character }: HeroCardProps) => {
  const characters: { [index: number]: string } = {
    0: "/fighter-p.png",
    1: "/rogue-p.png",
    2: "/warrior-p.png",
  };

  return (
    <Flex
      flexDir="column"
      justify="end"
      align="center"
      width="220px"
      height="284px"
      background="rgba(63, 49, 55, 0.6)"
      border="5px #D4D4D4 solid"
      borderRadius="20px"
      transform="skew(-10deg)"
      _hover={{
        background: "rgba(63, 49, 55, 0.8)",
        boxShadow: "lg",
        transform: "scale(1.02) skew(-10deg)",
      }}
      _active={{
        transform: "scale(1.0) skew(-10deg)",
      }}
      transition="all 0.3s ease"
    >
      <Image
        position="absolute"
        bottom="28px"
        left="-6"
        width="270px"
        maxWidth="110%"
        transform="skew(10deg)"
        src={characters[character]}
        alt="Ninja portrait"
      />
      <VStack
        width="230px"
        height="50px"
        background="#00FFD1"
        position="absolute"
        bottom="-5"
        left="-5px"
        borderBottomRadius="20px"
        justify="center"
      >
        <Text color="#2E2E2E" fontSize="28px" fontWeight="700">
          {name}
        </Text>
      </VStack>
    </Flex>
  );
};
