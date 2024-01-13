/*
 Temporary hard coded public rogue character page
 Update: this page may now be redundant
*/

import PublicHero from "./PublicHero";

const rogue = {
  id: {
    id: "0xc9c8b69eddc302e8730fa69c3189a1f6733e84064c6aa52006815a32a6f752b4",
  },
  name: "Aria",
  character: 1,
  level: 0,
  damage: 2,
  speed: 7,
  defense: 1,
};

export default function Rogue() {
  return <PublicHero hero={rogue} image={"/rogue-bg.jpg"} />;
}
