import Canvas from "@/lib/components/Canvas";
import { Divider, HeroCard, NewHeroCard } from "@/lib/components/Elements";
import { withUserWallet } from "@/lib/components/auth";
import {
  getSuiExplorerAddressUrl,
  useParsedSuiOwnedObjects,
} from "@/lib/hooks/sui";
import { HERO_MOVE_TYPE, Hero } from "@/lib/shared/hero";
import {
  Box,
  Flex,
  Button,
  Heading,
  VStack,
  ScaleFade,
  HStack,
} from "@chakra-ui/react";
import Link from "next/link";

export default withUserWallet(({ user, wallet }) => {
  const { data: heroes, isLoading } = useParsedSuiOwnedObjects(
    wallet.address,
    HERO_MOVE_TYPE,
    Hero
  );

  return (
    <Canvas image="/hero-select-bg.jpg">
      <Flex flexDir="column" align="center">
        {/* <div>
          <h2>{user.name}&apos;s wallet</h2>
          <Link href={getSuiExplorerAddressUrl(wallet.address)} target="_blank">
            {wallet.address}
          </Link>
        </div> */}
        {isLoading && <div>Loading heroes...</div>}
        {!isLoading && !heroes && <div>Failed to load heroes</div>}
        {!isLoading && heroes && (
          <div>
            {heroes.length === 0 && (
              <VStack gap="50px">
                <Heading size="3xl">No Heroes yet</Heading>
                <Link href="/heroes/new">
                  <ScaleFade
                    initialScale={0.95}
                    transition={{ enter: { duration: 1 } }}
                    in
                  >
                    <NewHeroCard />
                  </ScaleFade>
                </Link>
              </VStack>
            )}
            {heroes.length > 0 && (
              <VStack gap="50px">
                <Heading size="3xl">My Heroes</Heading>
                <ScaleFade
                  initialScale={0.95}
                  transition={{ enter: { duration: 1 } }}
                  in
                >
                  <HStack gap="42px">
                    {heroes.map((hero) => (
                      <Link key={hero.id.id} href={`/heroes/${hero.id.id}`}>
                        <HeroCard name={hero.name} character={hero.character} />
                      </Link>
                    ))}
                  </HStack>
                </ScaleFade>
              </VStack>
            )}
          </div>
        )}
        <VStack width="1028px" gap="50px" mt="70px">
          <Divider />
          <VStack gap="22px">
            <Link href="/heroes/new">
              <Button isDisabled={heroes?.length === 3} variant="solid">
                <Box transform="skew(10deg)">Create new hero</Box>
              </Button>
            </Link>
            <Button variant="outline">
              <Box transform="skew(10deg)">SUI Explorer</Box>
            </Button>
            <Link href="/api/auth/logout">
              <Button variant="ghost">Logout</Button>
            </Link>
          </VStack>
        </VStack>
      </Flex>
    </Canvas>
  );
});
