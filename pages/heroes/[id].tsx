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

import { useSendHero } from "@/lib/hooks/api";
import { getSuiExplorerObjectUrl, useParsedSuiObject } from "@/lib/hooks/sui";
import { Hero } from "@/lib/shared/hero";
import { ObjectOwner, ownerAddress } from "@/lib/shared/sui";
import { first } from "@/lib/shared/utils";
import { LOGIN_PAGE_PATH } from "@shinami/nextjs-zklogin";
import { useZkLoginSession } from "@shinami/nextjs-zklogin/client";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";

function HeroPage({ id, path }: { id: string; path: string }) {
  const { data: hero, isLoading } = useParsedSuiObject(id, Hero);

  if (isLoading) return <p>Loading hero...</p>;
  if (!hero) return <p>Failed to load hero</p>;

  return (
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
      <HeroControls hero={hero.content} owner={hero.owner} path={path} />
      <div>
        <Link href={"/"}>Go home</Link>
      </div>
    </div>
  );
}

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
