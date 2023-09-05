// This is a public page, with special treatment if user is logged in and owns the hero.
//
// Flow:
// 1. Retrieve hero info with useParsedSuiObject()
// 2. Retrieve user wallet if logged in
// 3. If user owns the hero
//    3a. Show "send" button / modal, submitting with useSendHero()
//    3b. Show "burn" button, submitting with useBurnHero()
//    3c. Retrieve level-up ticket for the hero, with useParsedSuiOwnedObjects()
//        3c1. If found, show new points to be allocated. Submit with useLevelUpHero()
//        3c2. Otherwise, show "request level-up" button, simulating an in-game milestone.
//             Submit with useNewLevelUpTicket()

import Canvas from "@/lib/components/Canvas";
import { Divider, HeroAttributes } from "@/lib/components/Elements";
import { useBurnHero, useWallet } from "@/lib/hooks/api";
import { getSuiExplorerObjectUrl, useParsedSuiObject } from "@/lib/hooks/sui";
import { Hero } from "@/lib/shared/hero";
import { ownerAddress } from "@/lib/shared/sui";
import { Box, Button, HStack, Heading, Icon, VStack } from "@chakra-ui/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const heroImages = {
  0: "/fighter-bg.jpg",
  1: "/rogue-bg.jpg",
  2: "/warrior-bg.jpg",
};

const TransferIcon = (
  <Icon>
    <path
      d="M20.6939 11.3536C20.7696 11.1709 20.7894 10.9697 20.7508 10.7757C20.7121 10.5817 20.6168 10.4035 20.4769 10.2636L15.4769 5.26364L14.0629 6.67764L17.3559 9.97064H4.76989V11.9706H19.7699C19.9677 11.9707 20.161 11.9121 20.3255 11.8023C20.4899 11.6925 20.6181 11.5363 20.6939 11.3536ZM4.84589 14.5876C4.77019 14.7704 4.7504 14.9715 4.78902 15.1656C4.82765 15.3596 4.92296 15.5378 5.06289 15.6776L10.0629 20.6776L11.4769 19.2636L8.18389 15.9706H20.7699V13.9706H5.76989C5.5721 13.9705 5.3787 14.029 5.2142 14.1388C5.04971 14.2487 4.92152 14.4049 4.84589 14.5876Z"
      fill="white"
    />
  </Icon>
);

const DeleteIcon = (
  <Icon>
    <path
      d="M6.7699 19.9706C6.7699 21.0706 7.6699 21.9706 8.7699 21.9706H16.7699C17.8699 21.9706 18.7699 21.0706 18.7699 19.9706V7.97064H6.7699V19.9706ZM19.7699 4.97064H16.2699L15.2699 3.97064H10.2699L9.2699 4.97064H5.7699V6.97064H19.7699V4.97064Z"
      fill="red"
    />
  </Icon>
);

export default function HeroPage() {
  const router = useRouter();
  const heroId = router.query.id as string;
  const { data: hero, isLoading: isLoadingHero } = useParsedSuiObject(
    heroId,
    Hero
  );

  const [editAttributes, setEditAttributes] = useState(false);
  const [heroAttributes, setHeroAttributes] = useState(hero?.content);

  useEffect(() => {
    setHeroAttributes(hero?.content);
  }, [hero]);

  const { data: wallet, isLoading: isLoadingWallet } = useWallet();

  const burnHero = useBurnHero();

  const handleDelete = () => {
    burnHero
      .mutateAsync({ heroId: heroId })
      .then(() => router.replace("/"))
      .catch(() => console.log("Hero delete unsuccessful"));
  };
  console.log(heroAttributes);
  return (
    <Canvas
      image={heroImages[hero?.content.character as keyof typeof heroImages]}
    >
      {isLoadingHero && <div>Loading hero...</div>}
      {!isLoadingHero && !hero && <div>Failed to load hero</div>}
      {hero && (
        <HStack
          mt="50px"
          width="80%"
          height="70%"
          justifyContent="space-between"
        >
          <VStack height="100%" align="start" justify="space-between">
            <Box>
              <Heading size="4xl">{hero.content.name}</Heading>
              <Heading>Level: {hero.content.level}</Heading>
              <VStack mt="42px" mb="32px" align="start" gap="22px">
                <HStack>
                  <Heading size="lg">Damage: </Heading>
                  <HeroAttributes
                    edit={editAttributes}
                    count={hero.content.damage}
                  />
                </HStack>
                <HStack>
                  <Heading size="lg">Speed:</Heading>
                  <HeroAttributes
                    edit={editAttributes}
                    count={hero.content.speed}
                  />
                </HStack>
                <HStack>
                  <Heading size="lg">Defense:</Heading>
                  <HeroAttributes
                    edit={editAttributes}
                    count={hero.content.defense}
                  />
                </HStack>
              </VStack>
              <Button
                onClick={() => setEditAttributes((prev) => !prev)}
                leftIcon={TransferIcon}
                size="md"
                variant="outline"
              >
                {editAttributes ? (
                  <Box transform="skew(10deg)">Save</Box>
                ) : (
                  <Box transform="skew(10deg)">Spend points</Box>
                )}
              </Button>
            </Box>
            <Link href="/">
              <Button minW="none" variant="ghost">
                Go back
              </Button>
            </Link>
          </VStack>
          <VStack width="646px" height="100%" align="center" justify="flex-end">
            <Divider />
            <HStack mt="22px" gap="22px">
              <Link
                href={getSuiExplorerObjectUrl(hero.content.id.id)}
                target="_blank"
              >
                <Button size="md" variant="outline">
                  <Box transform="skew(10deg)">SUI Explorer</Box>
                </Button>
              </Link>

              <Button leftIcon={TransferIcon} size="md" variant="outline">
                <Box transform="skew(10deg)">Transfer</Box>
              </Button>
              <Button
                onClick={handleDelete}
                leftIcon={DeleteIcon}
                size="md"
                variant="danger"
              >
                <Box transform="skew(10deg)">Delete hero</Box>
              </Button>
            </HStack>
          </VStack>
        </HStack>
      )}
      {/* <Box>
        {isLoadingWallet && <div>Loading wallet...</div>}
        {!isLoadingWallet && !wallet && <div>Failed to load wallet</div>}
        {hero && wallet && (
          <div>
            You{" "}
            {wallet.address === ownerAddress(hero.owner) ? "own" : "don't own"}{" "}
            this hero
          </div>
        )}
      </Box> */}
    </Canvas>
  );
}
