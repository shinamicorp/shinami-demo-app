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

import { useWallet } from "@/lib/hooks/api";
import { getSuiExplorerObjectUrl, useParsedSuiObject } from "@/lib/hooks/sui";
import { Hero } from "@/lib/shared/hero";
import { ownerAddress } from "@/lib/shared/sui";
import Link from "next/link";
import { useRouter } from "next/router";

export default function HeroPage() {
  const router = useRouter();
  const heroId = router.query.id as string;

  const { data: hero, isLoading: isLoadingHero } = useParsedSuiObject(
    heroId,
    Hero
  );
  const { data: wallet, isLoading: isLoadingWallet } = useWallet();

  return (
    <>
      {isLoadingHero && <div>Loading hero...</div>}
      {!isLoadingHero && !hero && <div>Failed to load hero</div>}
      {hero && (
        <div>
          <div>
            <Link
              href={getSuiExplorerObjectUrl(hero.content.id.id)}
              target="_blank"
            >
              Hero
            </Link>
          </div>
          <div>Name: {hero.content.name}</div>
          <div>Character: {hero.content.character}</div>
          <div>Level: {hero.content.level}</div>
        </div>
      )}
      {isLoadingWallet && <div>Loading wallet...</div>}
      {!isLoadingWallet && !wallet && <div>Failed to load wallet</div>}
      {hero && wallet && (
        <div>
          You{" "}
          {wallet.address === ownerAddress(hero.owner) ? "own" : "don't own"}{" "}
          this hero
        </div>
      )}
    </>
  );
}
