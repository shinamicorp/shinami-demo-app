import { useUser } from "@auth0/nextjs-auth0/client";
import {
  Button,
  Flex,
  Heading,
  VStack,
  Image,
  Box,
  HStack,
  Text,
} from "@chakra-ui/react";
import Link from "next/link";

export default function Home() {
  const { user, error, isLoading } = useUser();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error.message}</div>;

  if (user) {
    return (
      <div>
        <img src={user.picture!} alt={user.name!} />
        <h2>{user.name}</h2>
        <p>{user.email}</p>
        <p>
          <Link href="/wallet">My wallet</Link>
        </p>
        <p>
          <Link href="/api/auth/logout">Logout</Link>
        </p>
      </div>
    );
  } else {
    return (
      <Flex
        height="100vh"
        direction="column"
        gap="6"
        align="center"
        justify="center"
      >
        <VStack gap="10" background="#3D3652" p="12" rounded="10">
          <Heading>In-App Wallet demo</Heading>
          <Image
            boxSize="300px"
            src="https://uploads-ssl.webflow.com/62d16851bc140b39e44135a4/645adbb442ee12e393140809_wallet-hero.svg"
            alt="Wallet hero"
          />

          <Button minW="60" colorScheme="teal">
            <Link href="/api/auth/login">Login</Link>
          </Button>
        </VStack>
        <HStack gap="2">
          <Text>Powered by</Text>
          <Image
            width="100px"
            src="https://uploads-ssl.webflow.com/62d16851bc140b39e44135a4/63d964a0c586710214df828a_shinami-white.svg"
            alt="Shinami logo"
          />
        </HStack>
      </Flex>
    );
  }
}
