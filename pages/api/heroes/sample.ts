import { sui } from "@/lib/api/shinami";
import { Hero } from "@/lib/shared/hero";
import { parseObject } from "@/lib/shared/sui";
import { withInternalErrorHandler } from "@shinami/nextjs-zklogin/server/pages/utils";

const curatedHeroIds = [
  // TODO - Populate more
  "0x814cd2969402b158aad1373ccdc4fb175eb78431a9e6ce1733b7971d72be8214",
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
