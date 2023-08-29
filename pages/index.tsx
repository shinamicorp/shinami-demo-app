import Canvas from "@/lib/components/Canvas";
import { Button, Divider } from "@/lib/components/Elements";
import { withUserWallet } from "@/lib/components/auth";
import {
  getSuiExplorerAddressUrl,
  useParsedSuiOwnedObjects,
} from "@/lib/hooks/sui";
import { HERO_MOVE_TYPE, Hero } from "@/lib/shared/hero";
import { Box, Flex, Heading } from "@chakra-ui/react";
import Link from "next/link";

export default withUserWallet(({ user, wallet }) => {
  const { data: heroes, isLoading } = useParsedSuiOwnedObjects(
    wallet.address,
    HERO_MOVE_TYPE,
    Hero
  );

  return (
    <Canvas image="/home-bg.jpg">
      <Flex flexDir="column" align="center">
        {/* <div>
          <h2>{user.name}&apos;s wallet</h2>
          <Link href={getSuiExplorerAddressUrl(wallet.address)} target="_blank">
            {wallet.address}
          </Link>
        </div> */}
        {isLoading && <div>Loading heroes...</div>}
        {!isLoading && !heroes && <div>Failed to load heroes</div>}
        {!isLoading && heroes && (
          <div>
            {heroes.length === 0 && <Heading size="3xl">No Heroes yet</Heading>}
            {heroes.length > 0 && (
              <div>
                <Heading size="3xl">My Heroes</Heading>
                <ul>
                  {heroes.map((hero) => (
                    <li key={hero.id.id}>
                      <Link href={`/heroes/${hero.id.id}}`}>{hero.name}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
        <Flex flexDir="column" width="1028px" align="center" gap="22px">
          <Divider />
          <Button variant="solid">Create new hero</Button>
          <Button variant="outline">SUI Explorer</Button>
          <Button variant="outline">Logout</Button>
          <Link href="/heroes/new">New hero</Link>
          <Link href="/api/auth/logout">Sign out</Link>
        </Flex>
      </Flex>
    </Canvas>
  );
});
