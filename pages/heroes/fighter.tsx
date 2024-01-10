/*
 Temporary hard coded public fighter character page
*/

import PublicHero from "./PublicHero";

const fighter = {
  id: {
    id: "0x09f43352eeee404d33697db82d95d8a57a9f7bb737a24bf4c50c77d940f554df",
  },
  name: "Shilo",
  character: 0,
  level: 0,
  damage: 3,
  speed: 4,
  defense: 3,
};

export default function Fighter() {
  return <PublicHero hero={fighter} image={"/fighter-bg.jpg"} />;
}
