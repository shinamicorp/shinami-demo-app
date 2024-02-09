/**
 * Copyright 2024 Shinami Corp.
 * SPDX-License-Identifier: Apache-2.0
 */

import { sui } from "@/lib/api/shinami";
import { Hero } from "@/lib/shared/hero";
import { parseObject } from "@/lib/shared/sui";
import { withInternalErrorHandler } from "@shinami/nextjs-zklogin/server/pages/utils";

const curatedHeroIds = [
  // TODO - Populate more
  "0x814cd2969402b158aad1373ccdc4fb175eb78431a9e6ce1733b7971d72be8214",
  "0x8c9c200ed5b12aebe2c745d003059225191914bb3b7eabc3bc099cb1c0075ca7",
  "0xcde3b989bcafc8756dc64fae238cd64ada7853b2d3af6157dbb0c2a66d0d211e",
  "0x2fa4e8cac7dc7cc35a443ab30f426cb2dabe8b85c0dbda73a6b102e05caee58a",
];

export default withInternalErrorHandler<Hero[]>(async (_, res) => {
  const objs = await sui.multiGetObjects({
    ids: curatedHeroIds,
    options: { showContent: true },
  });
  const heroes = objs.map((x) => parseObject(x, Hero));

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
