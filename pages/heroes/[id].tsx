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

function HeroPage({ id, path }: { id: string; path: string }) {
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
  const {
    mutateAsync: newLevelUpTicket,
    isLoading: newLevelUpTicketIsLoading,
  } = useNewLevelUpTicket();
  const { mutateAsync: levelUpHero, isLoading: levelUpHeroLoading } =
    useLevelUpHero();
  const {
    mutateAsync: burnHero,
    isLoading: burnHeroIsLoading,
    isSuccess: burnHeroIsSuccess,
    isError: burnHeroIsError,
  } = useBurnHero();
  const {
    mutateAsync: sendHero,
    isLoading: sendHeroIsLoading,
    isSuccess: sendHeroIsSuccess,
    isError: sendHeroIsError,
  } = useSendHero();

  const [editAttributes, setEditAttributes] = useState(false);
  const [heroAttributes, setHeroAttributes] = useState<Hero>();
  const [showSendWindow, setShowSendWindow] = useState(false);
  const [chosenTicket, setChosenTicket] = useState<LevelUpTicket>();
  const [levelUpPoints, setLevelUpPoints] = useState(0);
  const [transferRecipient, setTransferRecipient] = useState<string>();

  useEffect(() => {
    if (!hero || !levelUpTickets) {
      setChosenTicket(undefined);
      setLevelUpPoints(0);
      setEditAttributes(false);
      return;
    }

    setHeroAttributes(hero.content);

    if (
      !chosenTicket ||
      !levelUpTickets.some((x) => x.id.id === chosenTicket.id.id)
    ) {
      const ticket = levelUpTickets.find(
        (x) => x.hero_id === hero.content.id.id
      );
      setChosenTicket(ticket);
      setLevelUpPoints(ticket ? ticket.attribute_points : 0);
      if (!ticket) setEditAttributes(false);
    }
  }, [hero, levelUpTickets, chosenTicket]);

  const handleDelete = () => {
    onOpen();
    burnHero({ heroId: heroId });
  };

  const handleLevelUp = () => {
    if (hero?.content.id) {
      newLevelUpTicket({ heroId: hero.content.id.id }).then(() => {
        setLevelUpPoints(4);
      });
    }
  };

  const handleLevelUpSave = () => {
    if (!hero || !levelUpTickets || !heroAttributes) {
      return;
    }

    const ticket = levelUpTickets.find(
      (ticket) => ticket.hero_id === hero?.content.id.id
    );
    if (ticket) {
      levelUpHero({
        heroId: hero?.content.id.id,
        damage: heroAttributes.damage - hero.content.damage,
        speed: heroAttributes.speed - hero.content.speed,
        defense: heroAttributes.defense - hero.content.defense,
        ticketId: ticket.id.id,
      }).then(() => {
        setLevelUpPoints(0);
        setEditAttributes(false);
      });
    }
  };

  const handleTransfer = (e: any) => {
    e.preventDefault();
    setShowSendWindow(false);
    if (hero && transferRecipient) {
      sendHero({
        heroId: hero.content.id.id,
        recipient: transferRecipient,
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
                    isDisabled={levelUpHeroLoading}
                  >
                    <Box transform="skew(10deg)">Cancel</Box>
                  </Button>
                  <Button
                    onClick={handleLevelUpSave}
                    size="md"
                    variant="plus"
                    isLoading={levelUpHeroLoading}
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
                  isDisabled={!chosenTicket}
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
                    display={chosenTicket ? "flex" : "none"}
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
                  <Box transform="skew(10deg)">View on Sui</Box>
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
                isDisabled={!!chosenTicket}
                isLoading={newLevelUpTicketIsLoading}
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
          backgroundImage="/mint-hero-bg.jpg"
          backgroundPosition="bottom"
          backgroundSize="cover"
          width="700px"
          height="600px"
          border="1px solid #9b9b9b"
          boxShadow="0px 0px 30px #ff880078"
        >
          <ModalBody
            width="432px"
            display="flex"
            flexDir="column"
            gap="32px"
            alignItems="center"
            justifyContent="center"
          >
            {burnHeroIsLoading && (
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
            {burnHeroIsSuccess && (
              <>
                <ScaleFade
                  initialScale={0.95}
                  transition={{ enter: { duration: 1 } }}
                  in
                >
                  <Heading mb="22px" textAlign="center" size="3xl">
                    So long comrade!
                  </Heading>
                  <Link href="/">
                    <Button>Go home</Button>
                  </Link>
                </ScaleFade>
              </>
            )}
            {burnHeroIsError && (
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
                      value={transferRecipient}
                      autoComplete="off"
                      onChange={(e) => setTransferRecipient(e.target.value)}
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
            {sendHeroIsLoading && (
              <>
                <Image src="/spinner.svg" alt="spinner" />
                <Heading textAlign="center" size="3xl">
                  Sending hero!
                </Heading>
              </>
            )}
            {sendHeroIsSuccess && (
              <>
                <Heading textAlign="center" size="3xl">
                  Hero sent!
                </Heading>
                <Link href="/">
                  <Button>Go home</Button>
                </Link>
              </>
            )}
            {sendHeroIsError && (
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

function HeroControls({
  hero,
  owner,
  path,
}: {
  hero: Hero;
  owner: ObjectOwner;
  path: string;
}) {
  const { user, localSession, isLoading } = useZkLoginSession();
  const { mutateAsync: send, isPending: isSending } = useSendHero();
  const sendTargetRef = useRef<HTMLInputElement>(null);

  if (isLoading) return <p>Loading zkLogin session...</p>;
  if (!user)
    return (
      <div>
        <Link
          href={`${LOGIN_PAGE_PATH}?${new URLSearchParams({
            redirectTo: path,
          })}`}
        >
          Please sign in
        </Link>
      </div>
    );
  if (user.wallet !== ownerAddress(owner))
    return <p>You don&apos;t own this hero</p>;

  return (
    <div>
      <input type="text" ref={sendTargetRef} disabled={isSending} />
      <button
        disabled={isSending}
        onClick={async (e) => {
          e.preventDefault();
          if (isSending) return;

          const recipient = sendTargetRef.current?.value?.trim();
          if (!recipient) return;

          console.log("Sending hero to", recipient);
          const { txDigest } = await send({
            heroId: hero.id.id,
            recipient,
            keyPair: localSession.ephemeralKeyPair,
          });
          console.log("Hero sent in tx", txDigest);
        }}
      >
        Send
      </button>
    </div>
  );
}

export default function Page() {
  const { isReady, query, asPath } = useRouter();
  const [heroId, setHeroId] = useState<string>();

  useEffect(() => {
    if (!isReady) return;
    const id = first(query.id);
    if (!id) throw new Error("Missing hero id");
    setHeroId(id);
  }, [isReady, query]);

  if (!heroId) return <p>Loading hero id...</p>;

  return <HeroPage id={heroId} path={asPath} />;
}
