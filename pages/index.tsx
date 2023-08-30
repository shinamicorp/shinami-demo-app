import Canvas from "@/lib/components/Canvas";
import {
  Button,
  Divider,
  HeroCard,
  NewHeroCard,
} from "@/lib/components/Elements";
import { withUserWallet } from "@/lib/components/auth";
import {
  getSuiExplorerAddressUrl,
  useParsedSuiOwnedObjects,
} from "@/lib/hooks/sui";
import { HERO_MOVE_TYPE, Hero } from "@/lib/shared/hero";
import { Box, Flex, HStack, Heading, VStack } from "@chakra-ui/react";
import Link from "next/link";

export default withUserWallet(({ user, wallet }) => {
  const { data: heroes, isLoading } = useParsedSuiOwnedObjects(
    wallet.address,
    HERO_MOVE_TYPE,
    Hero
  );

  return (
    <Canvas image="/home-bg.jpg">
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
                {/* <NewHeroCard /> */}
                <HStack gap="10">
                  <HeroCard name="Shilo" character={0} />
                  <HeroCard name="Olive" character={1} />
                  <HeroCard name="Ragnar" character={2} />
                </HStack>
              </VStack>
            )}
            {heroes.length > 0 && (
              <div>
                <Heading size="3xl">My Heroes</Heading>
                <ul>
                  {heroes.map((hero) => (
                    <li key={hero.id.id}>
                      <Link href={`/heroes/${hero.id.id}}`}>{hero.name}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
        <VStack width="1028px" gap="50px" mt="70px">
          <Divider />
          <VStack gap="22px">
            <Button variant="solid">Create new hero</Button>
            <Button variant="outline">SUI Explorer</Button>
            <Button variant="outline">Logout</Button>
          </VStack>
          {/* <Link href="/heroes/new">New hero</Link>
          <Link href="/api/auth/logout">Sign out</Link> */}
        </VStack>
      </Flex>
    </Canvas>
  );
});
