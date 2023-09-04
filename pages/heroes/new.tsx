// Flow:
// 1. Choose a character
// 2. Retrieve a mint ticket for the character
//    2a. useParsedSuiOwnedObjects()
//    2b. If non-existing, useNewMintTicket()
// 3. Allocate attribute points
// 4. Upon submit, useMintHero() and navigate to /

import { withUserWallet } from "@/lib/components/auth";
import Canvas from "@/lib/components/Canvas";
import { HeroCard, Divider, HeroAttributes } from "@/lib/components/Elements";
import { useMintHero, useNewMintTicket } from "@/lib/hooks/api";
import {
  getSuiExplorerAddressUrl,
  useParsedSuiOwnedObjects,
} from "@/lib/hooks/sui";
import {
  HERO_MOVE_TYPE,
  Hero,
  MINT_TICKET_MOVE_TYPE,
  MintHeroRequest,
  MintTicket,
} from "@/lib/shared/hero";
import {
  Button,
  Flex,
  VStack,
  Heading,
  Box,
  HStack,
  Image,
  Link,
  Text,
  Input,
  FormControl,
  FormErrorMessage,
  ScaleFade,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useState } from "react";
import { Carousel } from "react-carousel-card-3d";

const heroAtts = {
  0: { damage: 3, speed: 4, defense: 3 },
  1: { damage: 2, speed: 7, defense: 1 },
  2: { damage: 5, speed: 1, defense: 4 },
};

export default withUserWallet(({ user, wallet }) => {
  const [hero, setHero] = useState(0);
  const [heroName, setHeroName] = useState("");

  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const nextHero = () => {
    setHero((prev) => (prev + 1) % 3);
  };
  const prevHero = () => {
    setHero((prev) => (((prev - 1) % 3) + 3) % 3);
  };

  const { data: mintTickets, isLoading } = useParsedSuiOwnedObjects(
    wallet.address,
    MINT_TICKET_MOVE_TYPE,
    MintTicket
  );
  const newMintTicket = useNewMintTicket();
  const mintHero = useMintHero();

  const handleSubmit = (e: any) => {
    e.preventDefault();

    if (
      mintTickets &&
      !mintTickets.find((ticket) => ticket.character === hero)
    ) {
      newMintTicket.mutateAsync({ character: hero }).then(() => {
        const ticket = mintTickets.find(
          (ticket) =>
            ticket.character === hero && ticket.attribute_points === 10
        );
        if (ticket) {
          mintHero.mutate({
            name: heroName,
            damage: heroAtts[hero as keyof typeof heroAtts].damage,
            speed: heroAtts[hero as keyof typeof heroAtts].speed,
            defense: heroAtts[hero as keyof typeof heroAtts].defense,
            ticketId: ticket.id.id,
          });
        }
      });
    } else if (mintTickets) {
      const ticket = mintTickets.find(
        (ticket) => ticket.character === hero && ticket.attribute_points === 10
      );
      if (ticket) {
        mintHero.mutate({
          name: heroName,
          damage: heroAtts[hero as keyof typeof heroAtts].damage,
          speed: heroAtts[hero as keyof typeof heroAtts].speed,
          defense: heroAtts[hero as keyof typeof heroAtts].defense,
          ticketId: ticket.id.id,
        });
      }
    }

    setHeroName("");
    onOpen();
  };

  return (
    <Canvas image="/home-bg.jpg">
      <Flex flexDir="column" align="center">
        <VStack gap="50px">
          <Heading size="3xl">Select your Hero</Heading>

          <HStack gap="50px">
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
              <Box width="700px" height="400px">
                <Carousel
                  goToSlide={hero}
                  slides={[
                    {
                      key: 1,
                      content: <HeroCard name="Fighter" character={0} />,
                      onClick: () => setHero(0),
                    },
                    {
                      key: 2,
                      content: <HeroCard name="Rogue" character={1} />,
                      onClick: () => setHero(1),
                    },
                    {
                      key: 3,
                      content: <HeroCard name="Warrior" character={2} />,
                      onClick: () => setHero(2),
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
          <HStack gap="50px">
            <HStack>
              <Heading size="lg">Damage: </Heading>
              <HeroAttributes
                count={heroAtts[hero as keyof typeof heroAtts].damage}
              />
            </HStack>
            <HStack>
              <Heading size="lg">Speed:</Heading>
              <HeroAttributes
                count={heroAtts[hero as keyof typeof heroAtts].speed}
              />
            </HStack>
            <HStack>
              <Heading size="lg">Defense:</Heading>
              <HeroAttributes
                count={heroAtts[hero as keyof typeof heroAtts].defense}
              />
            </HStack>
          </HStack>
        </VStack>

        <VStack width="1028px" gap="50px" mt="70px">
          <Divider />
          <VStack width="350px" gap="22px">
            <form action="" onSubmit={handleSubmit}>
              <FormControl isRequired mb="22px">
                <Input
                  textAlign="center"
                  type="text"
                  value={heroName}
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
              <Button type="submit" variant="solid">
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
        <ModalOverlay />
        <ModalContent
          py="55px"
          display="flex"
          flexDir="column"
          alignItems="center"
          backgroundImage="/mint-hero-bg.png"
          backgroundPosition="bottom"
          backgroundSize="cover"
        >
          <ModalBody
            width="300px"
            display="flex"
            flexDir="column"
            gap="32px"
            alignItems="center"
          >
            <Heading textAlign="center" size="3xl">
              A hero is born!
            </Heading>
            <Button onClick={() => router.replace("/")}>
              Let&apos;s make history
            </Button>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Canvas>
  );
});
