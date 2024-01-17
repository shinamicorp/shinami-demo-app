import { Link } from "@chakra-ui/next-js";
import {
  Box,
  Button as ChakraButton,
  Flex,
  Heading,
  Image,
  VStack,
  Text,
  HStack,
  ScaleFade,
} from "@chakra-ui/react";
import { SetStateAction } from "react";
import { Hero, HeroAttributes } from "../shared/hero";

export const Divider = () => (
  <Box
    height="1px"
    width="100%"
    bgGradient="linear-gradient(270deg, rgba(217, 217, 217, 0.00) 0%, #D9D9D9 54.17%, rgba(217, 217, 217, 0.00) 100%)"
  ></Box>
);

export const Button = ({ children, variant, href, type = "" }: any) => (
  <Link href={href}>
    <ChakraButton type={type} variant={variant}>
      <span style={{ transform: "skew(10deg)" }}>{children}</span>
    </ChakraButton>
  </Link>
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
      boxShadow: "0px 0px 10px rgba(255, 255, 255, 0.45)",
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
  hasLevelUpPoints?: boolean;
}

export const HeroCard = ({
  name,
  character,
  hasLevelUpPoints,
}: HeroCardProps) => {
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
        transform: "scale(1.02) skew(-10deg)",
        boxShadow: "0px 0px 10px rgba(255, 255, 255, 0.45)",
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
        <Text color="#2E2E2E" fontSize="32px">
          {name}
        </Text>
      </VStack>
      <Box
        alignItems="center"
        justifyContent="center"
        position="absolute"
        top="-10px"
        right="-10px"
        backgroundColor="red"
        borderRadius="100px"
        w="40px"
        h="40px"
        transform="skew(10deg)"
        display={hasLevelUpPoints ? "flex" : "none"}
      >
        <Heading size="lg">+</Heading>
      </Box>
    </Flex>
  );
};

interface AttributePointsProps {
  count: number;
  edit?: boolean;
}

export const AttributePoints = ({
  count,
  edit = false,
}: AttributePointsProps) => {
  return (
    <HStack>
      {[...Array(count)].map((_, i) => (
        <ScaleFade
          initialScale={0.8}
          key={i}
          transition={{ enter: { duration: i / 8 } }}
          in
        >
          <Box
            key={i}
            height="26px"
            width="24px"
            bgGradient="linear-gradient(180deg, #00A3FF 27.60%, #0FF 100%)"
            transform="skew(-10deg)"
            borderRadius="4"
            border="2px #FFF solid"
          />
        </ScaleFade>
      ))}
      {edit &&
        [...Array(10 - count)].map((e, i) => (
          <ScaleFade
            initialScale={0.8}
            key={i}
            transition={{ enter: { duration: i / 8 } }}
            in
          >
            <Box
              key={i}
              height="26px"
              width="24px"
              transform="skew(-10deg)"
              borderRadius="4"
              border="2px #FFF solid"
            />
          </ScaleFade>
        ))}
    </HStack>
  );
};

interface HeroAttributeProps {
  hero: Hero;
  attribute: keyof HeroAttributes;
  isEditable: boolean;
  heroAttributes?: HeroAttributes;
  setHeroAttributes?: (value: SetStateAction<HeroAttributes>) => void;
  levelUpPoints?: number;
  setLevelUpPoints?: (value: SetStateAction<number>) => void;
}

export const HeroAttribute = ({
  attribute,
  hero,
  isEditable,
  heroAttributes,
  setHeroAttributes,
  levelUpPoints,
  setLevelUpPoints,
}: HeroAttributeProps) => {
  if (
    heroAttributes &&
    setHeroAttributes &&
    setLevelUpPoints &&
    levelUpPoints !== undefined
  )
    return (
      <HStack>
        <Heading size="lg">
          {attribute[0].toUpperCase() + attribute.slice(1).toLowerCase()}:{" "}
        </Heading>
        {isEditable && (
          <ChakraButton
            isDisabled={heroAttributes[attribute] === 0}
            variant="minus"
            size="sm"
            onClick={() => {
              setHeroAttributes((prev) => ({
                ...prev,
                [attribute]: prev[attribute] - 1,
              }));
              setLevelUpPoints((prev) => prev + 1);
            }}
          >
            -
          </ChakraButton>
        )}
        <AttributePoints
          edit={isEditable}
          count={hero[attribute] + heroAttributes[attribute]}
        />
        {isEditable && (
          <ChakraButton
            isDisabled={
              hero[attribute] + heroAttributes[attribute] === 10 ||
              levelUpPoints === 0
            }
            variant="plus"
            size="sm"
            onClick={() => {
              setHeroAttributes((prev) => ({
                ...prev,
                [attribute]: prev[attribute] + 1,
              }));
              setLevelUpPoints((prev) => prev - 1);
            }}
          >
            +
          </ChakraButton>
        )}
      </HStack>
    );

  return (
    <HStack>
      <Heading size="lg">
        {attribute[0].toUpperCase() + attribute.slice(1).toLowerCase()}:{" "}
      </Heading>
      <AttributePoints edit={isEditable} count={hero[attribute]} />
    </HStack>
  );
};

export const SocialIcon = ({ provider }: { provider: string }) => {
  switch (provider) {
    case "google":
      return <Image src="/google.svg" alt="Google icon" />;
    case "facebook":
      return <Image src="/facebook.svg" alt="Facebook icon" />;
    case "twitch":
      <Image src="/twitch.svg" alt="Twitch icon" />;
  }
};
