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
import { DeleteIcon, PlusIcon, TransferIcon } from "@/lib/components/Icons";
import { withUserWallet } from "@/lib/components/auth";
import {
  useBurnHero,
  useLevelUpHero,
  useNewLevelUpTicket,
  useSendHero,
  useWallet,
} from "@/lib/hooks/api";
import {
  getSuiExplorerObjectUrl,
  useParsedSuiObject,
  useParsedSuiOwnedObjects,
} from "@/lib/hooks/sui";
import {
  Hero,
  LEVEL_UP_TICKET_MOVE_TYPE,
  LevelUpTicket,
} from "@/lib/shared/hero";
import { ownerAddress } from "@/lib/shared/sui";
import {
  Box,
  Button,
  HStack,
  Heading,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  VStack,
  useDisclosure,
  Image,
  ScaleFade,
  FormControl,
  FormErrorMessage,
  Textarea,
} from "@chakra-ui/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const heroImages = {
  0: "/fighter-bg.jpg",
  1: "/rogue-bg.jpg",
  2: "/warrior-bg.jpg",
};

export default withUserWallet(({ user, wallet }) => {
  const router = useRouter();
  const heroId = router.query.id as string;

  //const { data: wallet, isLoading: isLoadingWallet } = useWallet();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { data: levelUpTickets, isFetched } = useParsedSuiOwnedObjects(
    wallet.address,
    LEVEL_UP_TICKET_MOVE_TYPE,
    LevelUpTicket
  );
  const { data: hero, isLoading: isLoadingHero } = useParsedSuiObject(
    heroId,
    Hero
  );
  const newLevelUpTicket = useNewLevelUpTicket();
  const levelUpHero = useLevelUpHero();
  const burnHero = useBurnHero();
  const sendHero = useSendHero();

  const [editAttributes, setEditAttributes] = useState(false);
  const [heroAttributes, setHeroAttributes] = useState(hero?.content);
  const [showSendWindow, setShowSendWindow] = useState(false);
  const [hasLevelUpTicket, setHasLevelUpTicket] = useState(false);
  const [levelUpPoints, setLevelUpPoints] = useState(0);
  const [walletTransfer, setWalletTransfer] = useState("");

  useEffect(() => {
    setHeroAttributes(hero?.content);

    const ticket = levelUpTickets?.find(
      (ticket) => ticket.hero_id === hero?.content.id.id
    );

    if (hero && levelUpTickets && ticket) {
      setHasLevelUpTicket(true);
      setLevelUpPoints(ticket.attribute_points);
    } else {
      setHasLevelUpTicket(false);
    }
  }, [hero, levelUpTickets]);

  const handleDelete = () => {
    onOpen();
    burnHero.mutateAsync({ heroId: heroId });
  };

  const handleLevelUp = () => {
    if (hero?.content.id) {
      newLevelUpTicket.mutateAsync({ heroId: hero.content.id.id }).then(() => {
        setLevelUpPoints(4);
      });
    }
  };

  const handleLevelUpSave = () => {
    const ticket = levelUpTickets?.find(
      (ticket) => ticket.hero_id === hero?.content.id.id
    );
    if (hero && ticket && heroAttributes) {
      levelUpHero
        .mutateAsync({
          heroId: hero?.content.id.id,
          damage: heroAttributes.damage - hero.content.damage,
          speed: heroAttributes.speed - hero.content.speed,
          defense: heroAttributes.defense - hero.content.defense,
          ticketId: ticket.id.id,
        })
        .then(() => {
          setLevelUpPoints(0);
          setEditAttributes(false);
        });
    }
  };

  const handleTransfer = (e: any) => {
    e.preventDefault();

    if (hero) {
      sendHero.mutateAsync({
        heroId: hero.content.id.id,
        recipient: walletTransfer,
      });
    }
  };
  return (
    <Canvas
      image={heroImages[hero?.content.character as keyof typeof heroImages]}
    >
      {isLoadingHero && <div>Loading hero...</div>}
      {!isLoadingHero && !hero && <div>Failed to load hero</div>}
      {hero && (
        <HStack
          mt="50px"
          width="83%"
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
                  {editAttributes && (
                    <Button
                      isDisabled={
                        heroAttributes?.damage === hero.content.damage
                      }
                      variant="minus"
                      size="sm"
                      onClick={() => {
                        setHeroAttributes((prev) => ({
                          ...prev!!,
                          damage: prev!!.damage - 1,
                        }));
                        setLevelUpPoints((prev) => prev + 1);
                      }}
                    >
                      -
                    </Button>
                  )}
                  <HeroAttributes
                    edit={editAttributes}
                    count={heroAttributes?.damage ?? 0}
                  />
                  {editAttributes && (
                    <Button
                      isDisabled={
                        heroAttributes?.damage === 10 || levelUpPoints === 0
                      }
                      variant="plus"
                      size="sm"
                      onClick={() => {
                        setHeroAttributes((prev) => ({
                          ...prev!!,
                          damage: prev!!.damage + 1,
                        }));
                        setLevelUpPoints((prev) => prev - 1);
                      }}
                    >
                      +
                    </Button>
                  )}
                </HStack>
                <HStack>
                  <Heading size="lg">Speed:</Heading>
                  {editAttributes && (
                    <Button
                      isDisabled={heroAttributes?.speed === hero.content.speed}
                      variant="minus"
                      size="sm"
                      onClick={() => {
                        setHeroAttributes((prev) => ({
                          ...prev!!,
                          speed: prev!!.speed - 1,
                        }));
                        setLevelUpPoints((prev) => prev + 1);
                      }}
                    >
                      -
                    </Button>
                  )}
                  <HeroAttributes
                    edit={editAttributes}
                    count={heroAttributes?.speed ?? 0}
                  />
                  {editAttributes && (
                    <Button
                      isDisabled={
                        heroAttributes?.speed === 10 || levelUpPoints === 0
                      }
                      variant="plus"
                      size="sm"
                      onClick={() => {
                        setHeroAttributes((prev) => ({
                          ...prev!!,
                          speed: prev!!.speed + 1,
                        }));
                        setLevelUpPoints((prev) => prev - 1);
                      }}
                    >
                      +
                    </Button>
                  )}
                </HStack>
                <HStack>
                  <Heading size="lg">Defense:</Heading>
                  {editAttributes && (
                    <Button
                      isDisabled={
                        heroAttributes?.defense === hero.content.defense
                      }
                      variant="minus"
                      size="sm"
                      onClick={() => {
                        setHeroAttributes((prev) => ({
                          ...prev!!,
                          defense: prev!!.defense - 1,
                        }));
                        setLevelUpPoints((prev) => prev + 1);
                      }}
                    >
                      -
                    </Button>
                  )}
                  <HeroAttributes
                    edit={editAttributes}
                    count={heroAttributes?.defense ?? 0}
                  />
                  {editAttributes && (
                    <Button
                      isDisabled={
                        heroAttributes?.defense === 10 || levelUpPoints === 0
                      }
                      variant="plus"
                      size="sm"
                      onClick={() => {
                        setHeroAttributes((prev) => ({
                          ...prev!!,
                          defense: prev!!.defense + 1,
                        }));
                        setLevelUpPoints((prev) => prev - 1);
                      }}
                    >
                      +
                    </Button>
                  )}
                </HStack>
                {editAttributes && (
                  <HStack>
                    <Heading size="lg">Level up points remaining:</Heading>
                    <Box
                      alignItems="center"
                      justifyContent="center"
                      backgroundColor="red"
                      borderRadius="100px"
                      w="40px"
                      h="40px"
                      display="flex"
                    >
                      <Heading size="lg">{levelUpPoints}</Heading>
                    </Box>
                  </HStack>
                )}
              </VStack>
              {editAttributes ? (
                <HStack>
                  <Button
                    onClick={() => {
                      setEditAttributes(false);
                      setHeroAttributes(hero?.content);
                      setLevelUpPoints(4);
                    }}
                    size="md"
                    variant="outline"
                    isDisabled={levelUpHero.isLoading}
                  >
                    <Box transform="skew(10deg)">Cancel</Box>
                  </Button>
                  <Button
                    onClick={handleLevelUpSave}
                    size="md"
                    variant="plus"
                    isLoading={levelUpHero.isLoading}
                    isDisabled={levelUpPoints > 0}
                  >
                    <Box transform="skew(10deg)">Level up!</Box>
                  </Button>
                </HStack>
              ) : (
                <Button
                  onClick={() => setEditAttributes(true)}
                  rightIcon={PlusIcon}
                  size="md"
                  variant="plus"
                  isDisabled={!hasLevelUpTicket}
                >
                  <Box transform="skew(10deg)">Spend points</Box>
                  <Box
                    position="absolute"
                    alignItems="center"
                    justifyContent="center"
                    top="-10px"
                    right="-10px"
                    backgroundColor="red"
                    borderRadius="100px"
                    h="28px"
                    width="28px"
                    transform="skew(10deg)"
                    display={hasLevelUpTicket ? "flex" : "none"}
                  >
                    {levelUpPoints}
                  </Box>
                </Button>
              )}
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
              <Link
                href={getSuiExplorerObjectUrl(hero.content.id.id)}
                target="_blank"
              >
                <Button size="md" variant="outline">
                  <Box transform="skew(10deg)">SUI Explorer</Box>
                </Button>
              </Link>

              <Button
                onClick={() => {
                  setShowSendWindow(true);
                  onOpen();
                }}
                leftIcon={TransferIcon}
                size="md"
                variant="outline"
              >
                <Box transform="skew(10deg)">Transfer</Box>
              </Button>
              <Button
                leftIcon={PlusIcon}
                size="md"
                variant="outline"
                onClick={handleLevelUp}
                isDisabled={hasLevelUpTicket}
                isLoading={newLevelUpTicket.isLoading}
              >
                <Box transform="skew(10deg)">Level up</Box>
              </Button>
              <Button
                onClick={handleDelete}
                leftIcon={DeleteIcon}
                size="md"
                variant="danger"
              >
                <Box transform="skew(10deg)">Burn hero</Box>
              </Button>
            </HStack>
          </VStack>
        </HStack>
      )}
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
        >
          <ModalBody
            width="432px"
            display="flex"
            flexDir="column"
            gap="32px"
            alignItems="center"
            justifyContent="center"
          >
            {burnHero.isLoading && (
              <>
                <ScaleFade
                  initialScale={0.95}
                  transition={{ enter: { duration: 1 } }}
                  in
                >
                  <VStack>
                    <Image src="/spinner.svg" alt="spinner" />
                    <Heading textAlign="center" size="3xl">
                      Burning hero!
                    </Heading>
                  </VStack>
                </ScaleFade>
              </>
            )}
            {burnHero.isSuccess && (
              <>
                <ScaleFade
                  initialScale={0.95}
                  transition={{ enter: { duration: 1 } }}
                  in
                >
                  <Heading mb="22px" textAlign="center" size="3xl">
                    So long comrade!
                  </Heading>
                  <Button onClick={() => router.replace("/")}>Go home</Button>
                </ScaleFade>
              </>
            )}
            {burnHero.isError && (
              <>
                <Heading textAlign="center" size="3xl">
                  Unable to burn hero
                </Heading>
                <Button onClick={onClose}>Go back</Button>
              </>
            )}
            {showSendWindow && (
              <>
                <Heading textAlign="center" size="3xl">
                  Transfer hero
                </Heading>
                <form action="" onSubmit={handleTransfer}>
                  <FormControl isRequired mb="22px">
                    <Textarea
                      value={walletTransfer}
                      autoComplete="off"
                      onChange={(e) => setWalletTransfer(e.target.value)}
                      _hover={{
                        border: "2px #FFF solid",
                        boxShadow: "0px 0px 10px rgba(255, 255, 255, 0.45)",
                      }}
                      _focus={{
                        border: "2px #FFF solid",
                        boxShadow: "0px 0px 10px rgba(255, 255, 255, 0.45)",
                      }}
                      _placeholder={{ color: "#fff" }}
                      border={"2px #FFF solid"}
                      placeholder="Enter wallet address"
                      fontFamily="var(--font-irishGrover)"
                      fontSize="2xl"
                      width="432px"
                      height="200px"
                    />
                    <FormErrorMessage>
                      Wallet address is required
                    </FormErrorMessage>
                  </FormControl>
                  <HStack justifyContent="space-between">
                    <Button
                      onClick={() => {
                        onClose();
                        setShowSendWindow(false);
                      }}
                      variant="outline"
                      size="md"
                    >
                      Cancel
                    </Button>
                    <Button type="submit" size="md">
                      Transfer
                    </Button>
                  </HStack>
                </form>
              </>
            )}
            {sendHero.isLoading && (
              <>
                <Image src="/spinner.svg" alt="spinner" />
                <Heading textAlign="center" size="3xl">
                  Sending hero!
                </Heading>
              </>
            )}
            {sendHero.isSuccess && (
              <>
                <Heading textAlign="center" size="3xl">
                  Hero sent!
                </Heading>
                <Button onClick={() => router.replace("/")}>Go home</Button>
              </>
            )}
            {sendHero.isError && (
              <>
                <Heading textAlign="center" size="3xl">
                  Unable to send hero
                </Heading>
                <Button onClick={onClose}>Go back</Button>
              </>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
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
});
