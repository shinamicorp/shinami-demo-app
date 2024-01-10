/*
 Temporary hard coded public warrior character page
*/

import PublicHero from "./PublicHero";

const warrior = {
  id: {
    id: "0xf5dce84316b5fdabb7147753b111e48cbbeadac9930f8ef6b04272ec37895760",
  },
  name: "Ragnar",
  character: 2,
  level: 0,
  damage: 5,
  speed: 1,
  defense: 4,
};

export default function Warrior() {
  return <PublicHero hero={warrior} image={"/warrior-bg.jpg"} />;
}
