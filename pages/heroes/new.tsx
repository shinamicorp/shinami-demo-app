// Flow:
// 1. Choose a character
// 2. Retrieve a mint ticket for the character
//    2a. useParsedSuiOwnedObjects()
//    2b. If non-existing, useNewMintTicket()
// 3. Allocate attribute points
// 4. Upon submit, useMintHero() and navigate to /

import { withUserWallet } from "@/lib/components/auth";
import Canvas from "@/lib/components/Canvas";
import { Carousel } from "@/lib/components/carousel";
import { HeroCard, Divider, HeroAttributes } from "@/lib/components/Elements";
import { useMintHero, useNewMintTicket } from "@/lib/hooks/api";
import {
  getSuiExplorerAddressUrl,
  useParsedSuiOwnedObjects,
} from "@/lib/hooks/sui";
import { MINT_TICKET_MOVE_TYPE, MintTicket } from "@/lib/shared/hero";
import {
  Button,
  Flex,
  VStack,
  Heading,
  Box,
  HStack,
  Image,
  Link,
  Input,
  FormControl,
  FormErrorMessage,
  ScaleFade,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  useDisclosure,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const characterAttrs = {
  0: { damage: 3, speed: 4, defense: 3 },
  1: { damage: 2, speed: 7, defense: 1 },
  2: { damage: 5, speed: 1, defense: 4 },
};

enum Heroes {
  FIGHTER = 0,
  ROGUE = 1,
  WARRIOR = 2,
}

export default withUserWallet(({ user, wallet }) => {
  const [hero, setHero] = useState(Heroes.FIGHTER);
  const [heroName, setHeroName] = useState("");
  const [hasMintTicket, setHasMintTicket] = useState(false);
  const { data: mintTickets } = useParsedSuiOwnedObjects(
    wallet.address,
    MINT_TICKET_MOVE_TYPE,
    MintTicket
  );
  const { mutateAsync: newMintTicket } = useNewMintTicket();
  const {
    mutateAsync: mintHero,
    isLoading: mintHeroLoading,
    isSuccess: mintHeroIsSuccess,
    isError: mintHeroIsError,
  } = useMintHero();

  useEffect(() => {
    if (
      mintTickets &&
      mintTickets.find(
        (ticket) => ticket.character === hero && ticket.attribute_points === 10
      )
    ) {
      setHasMintTicket(true);
    } else if (mintTickets && !hasMintTicket) {
      newMintTicket({ character: hero })
        .then(() => {
          setHasMintTicket(true);
        })
        .catch(() => setHasMintTicket(false));
    } else {
      setHasMintTicket(false);
    }
  }, [hero, mintTickets, hasMintTicket, newMintTicket]);

  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();

  //TODO use enums?
  const nextHero = () => {
    setHero((prev) => (prev + 1) % 3);
  };
  const prevHero = () => {
    setHero((prev) => (((prev - 1) % 3) + 3) % 3);
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();

    if (mintTickets) {
      const ticket = mintTickets.find(
        (ticket) => ticket.character === hero && ticket.attribute_points === 10
      );
      if (ticket) {
        mintHero({
          name: heroName,
          damage: characterAttrs[hero as keyof typeof characterAttrs].damage,
          speed: characterAttrs[hero as keyof typeof characterAttrs].speed,
          defense: characterAttrs[hero as keyof typeof characterAttrs].defense,
          ticketId: ticket.id.id,
        });
      }
      setHeroName("");
      onOpen();
    }
  };
  return (
    <Canvas image="/home-bg.jpg">
      <Flex flexDir="column" align="center">
        <VStack gap="30px">
          <Heading size="3xl">Select your Hero</Heading>

          <HStack gap="30px">
            <Link onClick={prevHero}>
              <Image
                style={{
                  transition: "all 0.2s ease",
                }}
                _hover={{
                  transform: "scale(1.03)",
                  opacity: "1.0",
                }}
                _active={{
                  transform: "scale(0.95)",
                }}
                src="/left-arrow.png"
                alt="left arrow"
                opacity={0.7}
                scale={0.95}
              />
            </Link>
            <ScaleFade
              initialScale={0.95}
              transition={{ enter: { duration: 1 } }}
              in
            >
              <Box width="700px" height="350px">
                <Carousel
                  goToSlide={hero}
                  slides={[
                    {
                      key: 1,
                      content: <HeroCard name="Fighter" character={0} />,
                      onClick: () => setHero(Heroes.FIGHTER),
                    },
                    {
                      key: 2,
                      content: <HeroCard name="Rogue" character={1} />,
                      onClick: () => setHero(Heroes.ROGUE),
                    },
                    {
                      key: 3,
                      content: <HeroCard name="Warrior" character={2} />,
                      onClick: () => setHero(Heroes.WARRIOR),
                    },
                  ]}
                  animationConfig={{ tension: 220, friction: 25 }}
                  offsetRadius={2}
                />
              </Box>
            </ScaleFade>
            <Link onClick={nextHero}>
              <Image
                style={{
                  transition: "all 0.2s ease",
                }}
                _hover={{
                  transform: "scale(1.03)",
                  opacity: "1.0",
                }}
                _active={{
                  transform: "scale(0.95)",
                }}
                src="/right-arrow.png"
                alt="right arrow"
                opacity={0.7}
                scale={0.95}
              />
            </Link>
          </HStack>
          <HStack gap="30px">
            <HStack>
              <Heading size="lg">Damage: </Heading>
              <HeroAttributes
                count={
                  characterAttrs[hero as keyof typeof characterAttrs].damage
                }
              />
            </HStack>
            <HStack>
              <Heading size="lg">Speed:</Heading>
              <HeroAttributes
                count={
                  characterAttrs[hero as keyof typeof characterAttrs].speed
                }
              />
            </HStack>
            <HStack>
              <Heading size="lg">Defense:</Heading>
              <HeroAttributes
                count={
                  characterAttrs[hero as keyof typeof characterAttrs].defense
                }
              />
            </HStack>
          </HStack>
        </VStack>

        <VStack width="1028px" gap="30px" mt="50px">
          <Divider />
          <VStack width="350px" gap="22px">
            <form action="" onSubmit={handleSubmit}>
              <FormControl isRequired mb="22px">
                <Input
                  textAlign="center"
                  type="text"
                  value={heroName}
                  autoComplete="off"
                  onChange={(e) => setHeroName(e.target.value)}
                  _hover={{
                    border: "2px #FFF solid",
                    boxShadow: "0px 0px 10px rgba(255, 255, 255, 0.45)",
                  }}
                  _focus={{
                    border: "2px #FFF solid",
                    boxShadow: "0px 0px 10px rgba(255, 255, 255, 0.45)",
                  }}
                  _placeholder={{ color: "#aaa" }}
                  border={"2px #FFF solid"}
                  py="30px"
                  placeholder="Enter hero name"
                  fontFamily="var(--font-irishGrover)"
                  fontSize="3xl"
                  transform="skew(-10deg)"
                />
                <FormErrorMessage>Hero name is required</FormErrorMessage>
              </FormControl>
              <Button type="submit" variant="solid" isDisabled={!hasMintTicket}>
                <Box transform="skew(10deg)">Let&apos;s go!</Box>
              </Button>
            </form>
            <Link href="/">
              <Button variant="ghost">Go back</Button>
            </Link>
          </VStack>
        </VStack>
      </Flex>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        closeOnOverlayClick={false}
        isCentered
        size="2xl"
      >
        <ModalOverlay background="#000000e6" />
        <ModalContent
          py="55px"
          display="flex"
          flexDir="column"
          alignItems="center"
          justifyContent="center"
          backgroundImage="/mint-hero-bg.png"
          backgroundPosition="bottom"
          backgroundSize="cover"
          width="700px"
          height="600px"
          border="1px solid #9b9b9b"
          boxShadow="0px 0px 30px #ff880078"
        >
          <ModalBody
            width="300px"
            display="flex"
            flexDir="column"
            gap="32px"
            alignItems="center"
            justifyContent="center"
          >
            {mintHeroLoading && (
              <>
                <Image src="/spinner.svg" alt="spinner" />
                <Heading textAlign="center" size="3xl">
                  Minting hero
                </Heading>
              </>
            )}
            {mintHeroIsSuccess && (
              <>
                <ScaleFade
                  initialScale={0.95}
                  transition={{ enter: { duration: 1 } }}
                  in
                >
                  <Heading mb="22px" textAlign="center" size="3xl">
                    A hero is born!
                  </Heading>
                  <Link href="/">
                    <Button>Let&apos;s make history</Button>
                  </Link>
                </ScaleFade>
              </>
            )}
            {mintHeroIsError && (
              <>
                <Heading textAlign="center" size="3xl">
                  Error creating hero
                </Heading>
                <Button onClick={onClose}>Go back</Button>
              </>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Canvas>
  );
});
