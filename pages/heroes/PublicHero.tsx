/*
 Temporary hard coded public hero component page
 Update: this page may now be redundant
*/

import Canvas from "@/lib/components/Canvas";
import { Divider, HeroAttribute } from "@/lib/components/Elements";

import { getSuiExplorerObjectUrl } from "@/lib/hooks/sui";
import { Hero } from "@/lib/shared/hero";

import { Box, Button, HStack, Heading, VStack, Flex } from "@chakra-ui/react";
import Link from "next/link";

interface PublicHeroProps {
  hero: Hero;
  image: string;
}

export default function PublicHero({ hero, image }: PublicHeroProps) {
  return (
    <Canvas image={image}>
      {hero && (
        <Flex justifyContent="space-between" width="90%" gap={10}>
          <VStack flex={1} mb={20} align="start" justify="space-between">
            <Box>
              <Heading size="4xl">{hero.name}</Heading>
              <Heading>Level: {hero.level}</Heading>
              <VStack mt="42px" mb="32px" align="start" gap="22px">
                <HeroAttribute
                  attribute={"damage"}
                  hero={hero}
                  isEditable={false}
                />
                <HeroAttribute
                  attribute={"speed"}
                  hero={hero}
                  isEditable={false}
                />
                <HeroAttribute
                  attribute={"defense"}
                  hero={hero}
                  isEditable={false}
                />
              </VStack>
            </Box>
          </VStack>
          <VStack flex={1} align="center" justify="flex-end">
            <Divider />
            <HStack mt="22px" gap="20px">
              <Link href={getSuiExplorerObjectUrl(hero.id.id)} target="_blank">
                <Button size="md" variant="outline">
                  <Box transform="skew(10deg)">View on Sui</Box>
                </Button>
              </Link>
            </HStack>
          </VStack>
        </Flex>
      )}
      <Box pos="absolute" bottom="3rem" left="3rem">
        <Link href="/">
          <Button paddingInlineStart={0} minW="none" variant="ghost">
            Go back
          </Button>
        </Link>
      </Box>
    </Canvas>
  );
}
