/**
 * Copyright 2024 Shinami Corp.
 * SPDX-License-Identifier: Apache-2.0
 */

import Canvas from "@/lib/components/Canvas";
import { Divider, HeroCard, NewHeroCard } from "@/lib/components/Elements";
import { useHeroesSample } from "@/lib/hooks/api";
import { useParsedSuiOwnedObjects } from "@/lib/hooks/sui";
import {
  HERO_MOVE_TYPE,
  Hero,
  LEVEL_UP_TICKET_MOVE_TYPE,
  LevelUpTicket,
} from "@/lib/shared/hero";
import { AuthContext } from "@/lib/shared/zklogin";
import {
  Box,
  Button,
  Flex,
  HStack,
  Heading,
  ScaleFade,
  Text,
  VStack,
  Link as ChakraLink,
} from "@chakra-ui/react";
import {
  AUTH_API_BASE,
  LOGIN_PAGE_PATH,
  ZkLoginUser,
} from "@shinami/nextjs-zklogin";
import { useZkLoginSession } from "@shinami/nextjs-zklogin/client";
import Link from "next/link";

export default function Home() {
  const { user, isLoading: isLoadingUser } = useZkLoginSession<AuthContext>();

  return (
    <Canvas image="/hero-select-bg.jpg" user={user}>
      <Flex flexDir="column" align="center" gap={2}>
        {user && <UserHome user={user} />}
        {!user && !isLoadingUser && <AnonymousHome />}
      </Flex>
    </Canvas>
  );
}

const AnonymousHome = () => {
  const { data: heroSamples } = useHeroesSample();
  return (
    <>
      <VStack gap="50px">
        <Heading size="3xl">Latest Heroes</Heading>
        <ScaleFade
          initialScale={0.95}
          transition={{ enter: { duration: 1 } }}
          in
        >
          <HStack gap="82px">
            {heroSamples?.map((hero) => (
              <Link key={hero.id.id} href={`/heroes/${hero.id.id}`}>
                <HeroCard name={hero.name} character={hero.character} />
              </Link>
            ))}
          </HStack>
        </ScaleFade>
      </VStack>
      <VStack width="1028px" gap="50px" mt="70px">
        <Divider />
        <VStack gap="22px">
          <Link href={LOGIN_PAGE_PATH}>
            <Button variant="solid">
              <Box transform="skew(10deg)">Create your own!</Box>
            </Button>
          </Link>
        </VStack>
      </VStack>
    </>
  );
};

const UserHome = ({ user }: { user: ZkLoginUser<AuthContext> }) => {
  const { data: heroes, isLoading: isLoadingHeroes } = useParsedSuiOwnedObjects(
    user.wallet,
    HERO_MOVE_TYPE,
    Hero,
  );
  const { data: levelUpTickets } = useParsedSuiOwnedObjects(
    user.wallet,
    LEVEL_UP_TICKET_MOVE_TYPE,
    LevelUpTicket,
  );

  if (isLoadingHeroes) return <Text fontSize="30px">Loading heroes...</Text>;

  if (heroes)
    return (
      <>
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
              <HStack gap="82px">
                {heroes.map((hero) => {
                  const levelup = levelUpTickets?.find(
                    (ticket) => ticket.hero_id === hero.id.id,
                  );
                  return (
                    <Link key={hero.id.id} href={`/heroes/${hero.id.id}`}>
                      <HeroCard
                        name={hero.name}
                        character={hero.character}
                        hasLevelUpPoints={!!levelup}
                      />
                    </Link>
                  );
                })}
              </HStack>
            </ScaleFade>
          </VStack>
        )}
        <VStack width="1028px" gap="50px" mt="70px">
          <Divider />
          <VStack gap="22px">
            <Link href="/heroes/new">
              <Button isDisabled={heroes?.length >= 3} variant="solid">
                {heroes?.length >= 3 ? (
                  <Box transform="skew(10deg)">Hero limit reached</Box>
                ) : (
                  <Box transform="skew(10deg)">Create new hero</Box>
                )}
              </Button>
            </Link>
            <Link href={`${AUTH_API_BASE}/logout`}>
              <Button variant="ghost">Sign out</Button>
            </Link>
          </VStack>
        </VStack>
      </>
    );
};
