/**
 * Copyright 2024 Shinami Corp.
 * SPDX-License-Identifier: Apache-2.0
 */

import { sui } from "@/lib/api/shinami";
import { Hero } from "@/lib/shared/hero";
import { parseObject } from "@/lib/shared/sui";
import { withInternalErrorHandler } from "@shinami/nextjs-zklogin/server/pages/utils";

const curatedHeroIds = [
  "0x814cd2969402b158aad1373ccdc4fb175eb78431a9e6ce1733b7971d72be8214", // Big Dude - warrior - 0
  "0x8c9c200ed5b12aebe2c745d003059225191914bb3b7eabc3bc099cb1c0075ca7", // Aria - rogue - 0
  "0xcde3b989bcafc8756dc64fae238cd64ada7853b2d3af6157dbb0c2a66d0d211e", // Ragnar - warrior - 0
  "0x2fa4e8cac7dc7cc35a443ab30f426cb2dabe8b85c0dbda73a6b102e05caee58a", // Shilo - fighter - 0
  "0x32ad81b5e7c9c6ae97c8b4c9c2576be872b16ca9f0c791d71180e828e6f2ddfe", // bashful - warrior - 3
  "0x052a54e11ac603fd841967132e58b80b1814f18f39beab9bfd97feb290fbfe5e", // Wario - warrior - 2
  "0x5d8ffdf92570497f8fbddf2ae2f2e315765ae288d4efd8e74844ef946067c1cf", // ODB - fighter - 3
  "0x1bb78abd48f344b27cd8872dca8813fed8d72ea051eac78dde9cc5d2c41c048c", // Raekwon - warrior - 2
];

export default withInternalErrorHandler<Hero[]>(async (_, res) => {
  const objs = await sui.multiGetObjects({
    ids: curatedHeroIds,
    options: { showContent: true },
  });
  const heroes = objs.flatMap((x) => {
    try {
      return parseObject(x, Hero);
    } catch (e) {
      console.error("Failed to parse hero", x, e);
      return [];
    }
  });

  // Randomly sample one hero of each character
  const sample = heroes.reduce(
    (sample, hero) => {
      const key = hero.character;
      const existing = sample.get(key);

      if (!existing) {
        sample.set(key, { hero, counter: 1 });
      } else {
        const counter = existing.counter + 1;
        if (Math.random() < 1 / counter) {
          // Include the new hero in the sample
          sample.set(key, { hero, counter });
        } else {
          // Keep the existing hero in the sample
          sample.set(key, { hero: existing.hero, counter });
        }
      }

      return sample;
    },
    new Map<
      number,
      {
        hero: Hero;
        counter: number;
      }
    >()
  );

  res.json(Array.from(sample.values(), (x) => x.hero));
});
