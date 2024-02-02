import Canvas from "@/lib/components/Canvas";
import { Divider, HeroCard, NewHeroCard } from "@/lib/components/Elements";
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

      <Text position="absolute" bottom={6} px={4} textAlign="center">
        This demo is powered by Shinami’s developer platform on Sui. For more
        information on how it works, visit our website.
      </Text>
    </Canvas>
  );
}

const AnonymousHome = () => {
  return (
    <>
      <VStack gap="50px">
        <Heading size="3xl">Latest Heroes</Heading>
        <ScaleFade
          initialScale={0.95}
          transition={{ enter: { duration: 1 } }}
          in
        >
          {/* TODO - fetch these from api once available */}
          <HStack gap="82px">
            <Link
              href={`/heroes/0x2fa4e8cac7dc7cc35a443ab30f426cb2dabe8b85c0dbda73a6b102e05caee58a`}
            >
              <HeroCard name="Shilo" character={0} />
            </Link>
            <Link
              href={`/heroes/0x8c9c200ed5b12aebe2c745d003059225191914bb3b7eabc3bc099cb1c0075ca7`}
            >
              <HeroCard name="Aria" character={1} />
            </Link>
            <Link
              href={`/heroes/0xcde3b989bcafc8756dc64fae238cd64ada7853b2d3af6157dbb0c2a66d0d211e`}
            >
              <HeroCard name="Ragnar" character={2} />
            </Link>
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
    Hero
  );
  const { data: levelUpTickets } = useParsedSuiOwnedObjects(
    user.wallet,
    LEVEL_UP_TICKET_MOVE_TYPE,
    LevelUpTicket
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
                    (ticket) => ticket.hero_id === hero.id.id
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
              <Button isDisabled={heroes?.length === 3} variant="solid">
                {heroes?.length === 3 ? (
                  <Box transform="skew(10deg)">Hero limit reached</Box>
                ) : (
                  <Box transform="skew(10deg)">Create new hero</Box>
                )}
              </Button>
            </Link>
            <Link href={`${AUTH_API_BASE}/logout`}>
              <Button variant="ghost">Logout</Button>
            </Link>
          </VStack>
        </VStack>
      </>
    );
};
