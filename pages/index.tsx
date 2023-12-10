import Canvas from "@/lib/components/Canvas";
import { Divider, HeroCard, NewHeroCard } from "@/lib/components/Elements";
import {
  getSuiExplorerAccountUrl,
  useParsedSuiOwnedObjects,
} from "@/lib/hooks/sui";
import {
  HERO_MOVE_TYPE,
  Hero,
  LEVEL_UP_TICKET_MOVE_TYPE,
  LevelUpTicket,
} from "@/lib/shared/hero";
import {
  Box,
  Flex,
  Button,
  Heading,
  VStack,
  ScaleFade,
  HStack,
} from "@chakra-ui/react";
import { AUTH_API_BASE } from "@shinami/nextjs-zklogin";
import { withZkLoginSessionRequired } from "@shinami/nextjs-zklogin/client";
import Link from "next/link";

export default withZkLoginSessionRequired(({ session }) => {
  const { user } = session;
  const { data: heroes, isLoading } = useParsedSuiOwnedObjects(
    user.wallet,
    HERO_MOVE_TYPE,
    Hero
  );

  const { data: levelUpTickets } = useParsedSuiOwnedObjects(
    wallet.address,
    LEVEL_UP_TICKET_MOVE_TYPE,
    LevelUpTicket
  );

  return (
    <Canvas image="/hero-select-bg.jpg">
      <Flex flexDir="column" align="center">
      <h2>
          {user.jwtClaims.email as string}({user.oidProvider})&apos;s wallet
        </h2>
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
                    {heroes.map((hero) => {
                      const levelup = levelUpTickets?.find(
                        (ticket) => ticket.hero_id === hero.id.id
                      );
                      return (
                        <Link key={hero.id.id} href={`/heroes/${hero.id.id}`}>
                          <HeroCard
                            name={hero.name}
                            character={hero.character}
                            levelUpPoints={!!levelup}
                          />
                        </Link>
                      );
                    })}
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
                {heroes?.length === 3 ? (
                  <Box transform="skew(10deg)">Hero limit reached</Box>
                ) : (
                  <Box transform="skew(10deg)">Create new hero</Box>
                )}
              </Button>
            </Link>
            <Link
              href={getSuiExplorerAddressUrl(wallet.address)}
              target="_blank"
            >
              <Button variant="outline">
                <Box transform="skew(10deg)">View address</Box>
              </Button>
            </Link>
            <Link href={`${AUTH_API_BASE}>
              <Button variant="ghost">Logout</Button>
            </Link>
          </VStack>
        </VStack>
      </Flex>
    </Canvas>
  );
});
