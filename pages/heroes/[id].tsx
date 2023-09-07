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
  MINT_TICKET_MOVE_TYPE,
  MintTicket,
} from "@/lib/shared/hero";
import { ownerAddress } from "@/lib/shared/sui";
import {
  Box,
  Button,
  HStack,
  Heading,
  Icon,
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
  Input,
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

const TransferIcon = (
  <Icon>
    <path
      d="M20.6939 11.3536C20.7696 11.1709 20.7894 10.9697 20.7508 10.7757C20.7121 
      10.5817 20.6168 10.4035 20.4769 10.2636L15.4769 5.26364L14.0629 6.67764L17.3559 
      9.97064H4.76989V11.9706H19.7699C19.9677 11.9707 20.161 11.9121 20.3255 11.8023C20.4899 
      11.6925 20.6181 11.5363 20.6939 11.3536ZM4.84589 14.5876C4.77019 14.7704 4.7504 14.9715 
      4.78902 15.1656C4.82765 15.3596 4.92296 15.5378 5.06289 15.6776L10.0629 20.6776L11.4769 
      19.2636L8.18389 15.9706H20.7699V13.9706H5.76989C5.5721 13.9705 5.3787 14.029 5.2142 
      14.1388C5.04971 14.2487 4.92152 14.4049 4.84589 14.5876Z"
      fill="white"
    />
  </Icon>
);

const DeleteIcon = (
  <Icon>
    <path
      d="M6.7699 19.9706C6.7699 21.0706 7.6699 21.9706 8.7699 21.9706H16.7699C17.8699 21.9706 18.7699 21.0706 
      18.7699 19.9706V7.97064H6.7699V19.9706ZM19.7699 4.97064H16.2699L15.2699 3.97064H10.2699L9.2699 
      4.97064H5.7699V6.97064H19.7699V4.97064Z"
      fill="red"
    />
  </Icon>
);

const PlusIcon = (
  <Icon>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12.3397 23.4711C18.6565 23.4711 23.7772 18.3503 23.7772 12.0336C23.7772 5.71681 18.6565 
      0.596069 12.3397 0.596069C6.02296 0.596069 0.902222 5.71681 0.902222 12.0336C0.902222 18.3503 
      6.02296 23.4711 12.3397 23.4711ZM13.9323 5.95634L10.9765 6.08374C11.0614 6.50843 11.1294 6.88215 
      11.1803 7.2049C11.2483 7.51067 11.2992 7.76548 11.3332 7.96933C11.3842 8.20715 11.4181 8.411 
      11.4351 8.58087C11.4521 8.73376 11.4691 8.9376 11.4861 9.19241C11.5031 9.41325 11.5116 9.69354 
      11.5116 10.0333C11.5286 10.356 11.537 10.7383 11.537 11.1799H9.52406H8.75963H8.07164C7.83382
       11.1799 7.53655 11.1714 7.17981 11.1544C6.84007 11.1375 6.44087 11.112 5.98221 11.078L6.16058 
       13.1674C6.51731 13.1335 6.84856 13.1165 7.15433 13.1165C7.4601 13.0995 7.72341 13.074 7.94424 
       13.04C8.19905 13.023 8.42838 12.9976 8.63222 12.9636C8.83607 12.9466 9.07389 12.9296 9.34569 
       12.9126C9.58351 12.8956 9.8638 12.8871 10.1866 12.8871C10.5263 12.8702 10.9085 12.8702 11.3332 
       12.8871C11.3502 13.125 11.3587 13.3798 11.3587 13.6516C11.3587 13.9064 11.3502 14.1527 11.3332 
       14.3905L11.2822 15.2059C11.2653 15.4267 11.2398 15.6816 11.2058 15.9703C11.1718 16.2082 11.1294 
       16.5139 11.0784 16.8876C11.0444 17.2444 10.9935 17.6521 10.9255 18.1107H13.7029C13.618 17.6181 
       13.5415 17.1934 13.4736 16.8367C13.4226 16.48 13.3802 16.1742 13.3462 15.9194C13.2952 15.6306 
       13.2613 15.3758 13.2443 15.1549C13.2103 14.9511 13.1933 14.7303 13.1933 14.4924C13.1763 14.2886 
       13.1678 14.0593 13.1678 13.8045C13.1848 13.5496 13.2103 13.2779 13.2443 12.9891C13.7369 12.9721 
       14.1616 12.9551 14.5183 12.9381C14.892 12.9211 15.2063 12.9126 15.4611 12.9126H16.2255C16.4294 
       12.9296 16.6587 12.9381 16.9135 12.9381C17.1343 12.9551 17.3892 12.9636 17.6779 12.9636C17.9837 
       12.9636 18.3235 12.9806 18.6972 13.0145L18.5953 10.8487C18.3914 10.9166 18.1791 10.9676 17.9582 
       11.0016C17.7544 11.0185 17.559 11.0355 17.3722 11.0525C17.1683 11.0695 16.9645 11.078 16.7606 
       11.078H15.9452C15.6565 11.078 15.2912 11.0865 14.8496 11.1035C14.4249 11.1205 13.9068 11.1375 
       13.2952 11.1544C13.3122 10.8147 13.3292 10.5004 13.3462 10.2116C13.3632 9.92287 13.3717 9.65956 
       13.3717 9.42174V8.6828C13.3717 8.46196 13.3972 8.20715 13.4481 7.91837C13.4821 7.68055 13.5331 
       7.40026 13.601 7.0775C13.6859 6.73775 13.7964 6.36403 13.9323 5.95634Z"
      fill="white"
    />
  </Icon>
);

export default withUserWallet(({ user, wallet }) => {
  const router = useRouter();
  const heroId = router.query.id as string;

  const { isOpen, onOpen, onClose } = useDisclosure();
  //const { data: wallet, isLoading: isLoadingWallet } = useWallet();
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
  const [heroStatus, setHeroStatus] = useState(0);
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
  }, [hero, levelUpTickets, hasLevelUpTicket, isFetched]);

  const handleDelete = () => {
    setHeroStatus(0);
    onOpen();
    burnHero
      .mutateAsync({ heroId: heroId })
      .then(() => setHeroStatus(1))
      .catch(() => {
        setHeroStatus(2);
        console.log("Hero delete unsuccessful");
      });
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
      sendHero
        .mutateAsync({
          heroId: hero.content.id.id,
          recipient: walletTransfer,
        })
        .then(() => {
          setHeroStatus(4);
        })
        .catch(() => {
          setHeroStatus(5);
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
                  setHeroStatus(3);
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
                <Box transform="skew(10deg)">Delete hero</Box>
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
            {heroStatus === 0 && (
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
            {heroStatus == 1 && (
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
            {heroStatus == 2 && (
              <>
                <Heading textAlign="center" size="3xl">
                  Unable to burn hero
                </Heading>
                <Button onClick={onClose}>Go back</Button>
              </>
            )}
            {heroStatus == 3 && !sendHero.isLoading && (
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
                        setHeroStatus(0);
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
            {heroStatus === 4 && (
              <>
                <Heading textAlign="center" size="3xl">
                  Hero sent!
                </Heading>
                <Button onClick={() => router.replace("/")}>Go home</Button>
              </>
            )}
            {heroStatus == 5 && (
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
