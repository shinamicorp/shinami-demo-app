# Move package

This Move package defines data types and mutation rules for the _imaginary_ Shinami game.

## Data types

| Type                  | Description                                 |
| --------------------- | ------------------------------------------- |
| `hero::Hero`          | The primary entity players mint and evolve  |
| `hero::MintTicket`    | A one-time authorization to mint a new hero |
| `hero::LevelUpTicket` | A one-time authorization to level up a hero |

## Roles

We categorize all parties that can interact with this Move package into 4 roles, from highest to lowest privilege:

### Publisher

The publisher of this package, identified by the possession of the corresponding `sui::package::Publisher`.
This role is intended to be operated by a human.

Priviledged operations:

- Designating admin accounts by minting and transferring `hero::AdminCap` objects.

### Admin

A game admin, identified by the possession of a `hero::AdminCap`.
This role is intended to be machine-operated, running on game servers.
It can also be played by a human when ad-hoc operations need to be performed.

Priviledged operations:

- Issuing and transferring new `hero::MintTicket` to players, which indirectly controls the supply of `hero::Hero` objects.
- Issuing and transferring new `hero::LevelUpTicket` to players, which indirectly controls the evolution of `hero::Hero` objects.

### Player

A game player, identified by the possession of a `hero::Hero` or various types of tickets.
This role is intended to be controlled by a human player.

Priviledged operations:

- Minting a new `hero::Hero` upon possessing a `hero::MintTicket`.
- Leveling up an owned `hero::Hero` upon possessing a corresponding `hero::LevelUpTicket`.
- Transferring an owned `hero::Hero` to someone else.
  - This allows players to freely export their heroes to their self-custody wallets, or to a marketplace.
  - They can also import heroes acquired somewhere else into their in-game wallets.

### Observer

Everyone else.
Since all hero attributes are stored on-chain in a non-obfuscated fashion, anyone can read them.
However, they cannot cause any mutations on them.
