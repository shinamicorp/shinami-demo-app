/*
 Temporary hard coded public hero component page
*/

import Canvas from "@/lib/components/Canvas";
import { Divider, HeroAttribute } from "@/lib/components/Elements";

import { getSuiExplorerObjectUrl } from "@/lib/hooks/sui";
import { Hero } from "@/lib/shared/hero";

import { Box, Button, HStack, Heading, VStack } from "@chakra-ui/react";
import Link from "next/link";

interface PublicHeroProps {
  hero: Hero;
  image: string;
}

export default function PublicHero({ hero, image }: PublicHeroProps) {
  return (
    <Canvas image={image}>
      {hero && (
        <HStack
          mt="50px"
          width="83%"
          height="70%"
          justifyContent="space-between"
        >
          <VStack height="100%" align="start" justify="space-between">
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

            <Link href="/">
              <Button paddingInlineStart={0} minW="none" variant="ghost">
                Go back
              </Button>
            </Link>
          </VStack>
          <VStack width="646px" height="100%" align="center" justify="flex-end">
            <Divider />
            <HStack mt="22px" gap="20px">
              <Link href={getSuiExplorerObjectUrl(hero.id.id)} target="_blank">
                <Button size="md" variant="outline">
                  <Box transform="skew(10deg)">View on Sui</Box>
                </Button>
              </Link>
            </HStack>
          </VStack>
        </HStack>
      )}
    </Canvas>
  );
}
