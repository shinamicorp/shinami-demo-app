// Flow:
// 1. Choose a character
// 2. Retrieve a mint ticket for the character
//    2a. useParsedSuiOwnedObjects()
//    2b. If non-existing, useNewMintTicket()
// 3. Allocate attribute points
// 4. Upon submit, useMintHero() and navigate to /

import Canvas from "@/lib/components/Canvas";
import { Button, HeroCard } from "@/lib/components/Elements";
import { Flex, VStack, Heading, HStack, Divider } from "@chakra-ui/react";
import Link from "next/link";

const CreateHero = () => {
  return (
    <Canvas image="/home-bg.jpg">
      <Flex flexDir="column" align="center">
        <div>
          <VStack gap="50px">
            <Heading size="3xl">Select your Hero</Heading>

            <HStack gap="10">
              <HeroCard name="Fighter" character={0} />
              <HeroCard name="Rogue" character={1} />
              <HeroCard name="Warrior" character={2} />
            </HStack>
          </VStack>
        </div>

        <VStack width="1028px" gap="50px" mt="70px">
          <Divider />
          <VStack gap="22px">
            <Button variant="solid" href={"/"}>
              Let&apos;s go
            </Button>
            <Button variant="outline" href={"/"}>
              Go back
            </Button>
          </VStack>
          {/* <Link href="/heroes/new">New hero</Link>
            <Link href="/api/auth/logout">Sign out</Link> */}
        </VStack>
      </Flex>
    </Canvas>
  );
};

export default CreateHero;
