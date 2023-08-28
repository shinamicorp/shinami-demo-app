// Copyright 2023 Shinami Corp.
// SPDX-License-Identifier: Apache-2.0

/// An example module to create game heroes and manage their lifecycles.
module shinami_demo::hero {
    use sui::tx_context::{sender, TxContext};
    use std::string::{Self, utf8, String};
    use sui::transfer;
    use sui::object::{Self, ID, UID};

    use sui::package::{Self, Publisher};
    use sui::display;


    const EBadName: u64 = 0;
    const EAttributePointsMismatch: u64 = 1;
    const EHeroIdMismatch: u64 = 2;

    /// A collectible hero in the imaginary Shinami games.
    /// Can be tranferred freely.
    struct Hero has key, store {
        id: UID,

        // Immutable attributes
        character: u8,

        // Mutable attributes
        name: String,
        level: u8,
        damage: u8,
        speed: u8,
        defense: u8,
    }

    /// A ticket to mint a new hero.
    /// Not publically transferrable.
    struct MintTicket has key {
        id: UID,

        /// Hero character.
        character: u8,

        /// Initial level.
        level: u8,

        /// Initial attribute points to be allocated.
        attribute_points: u8,
    }

    /// A ticket to level up a hero.
    /// Can be tranferred freely, but is only applicable to a specific hero.
    struct LevelUpTicket has key, store {
        id: UID,

        /// Id of the hero to level up.
        hero_id: ID,

        /// Additional attribute points to be allocated.
        attribute_points: u8,
    }

    /// Capability to run privileged operations.
    /// Not publically transferrable.
    struct AdminCap has key { id: UID }

    /// One-Time-Witness for the module.
    struct HERO has drop {}

    /// Initializes the module by:
    /// - Claiming the publisher.
    /// - Creating a display protocol for heroes.
    /// - Issuing an admin cap to the sender.
    fun init(otw: HERO, ctx: &mut TxContext) {
        // Display properties defined by the standard:
        // https://docs.sui.io/build/sui-object-display#display-properties
        let keys = vector[
            utf8(b"name"),
            utf8(b"description"),
            utf8(b"link"),
            utf8(b"image_url"),
            utf8(b"thumbnail_url"),
            utf8(b"project_url"),
            utf8(b"creator"),
        ];
        let values = vector[
            utf8(b"{name}"),
            utf8(b"A collectible hero in the imaginary Shinami games"),
            utf8(b"https://demo.shinami.com/heroes/{id}"),
            utf8(b"https://assets.shinami.com/heroes/{character}.png"),
            utf8(b"https://assets.shinami.com/heroes/{character}_thumb.png"),
            utf8(b"https://demo.shinami.com"),
            utf8(b"Shinami")
        ];

        let publisher = package::claim(otw, ctx);

        let display = display::new_with_fields<Hero>(
            &publisher, keys, values, ctx
        );
        display::update_version(&mut display);
        transfer::public_transfer(display, sender(ctx));

        new_admin_cap_to_recipient(&publisher, sender(ctx), ctx);

        transfer::public_transfer(publisher, sender(ctx));
    }

    ////////////////////////////////////////////////////////////////////////////
    // Publisher-only operations.
    ////////////////////////////////////////////////////////////////////////////

    /// Creates a new admin cap.
    public fun new_admin_cap(_: &Publisher, ctx: &mut TxContext): AdminCap {
        AdminCap { id: object::new(ctx) }
    }

    /// Transfers an admin cap.
    public fun transfer_admin_cap(_: &Publisher, cap: AdminCap, recipient: address) {
        transfer::transfer(cap, recipient);
    }

    /// Issues a new admin cap to the recipient.
    /// A convenience function for the CLI.
    public fun new_admin_cap_to_recipient(
        publisher: &Publisher,
        recipient: address,
        ctx: &mut TxContext,
    ) {
        transfer_admin_cap(publisher, new_admin_cap(publisher, ctx), recipient);
    }

    ////////////////////////////////////////////////////////////////////////////
    // Admin-only operations.
    ////////////////////////////////////////////////////////////////////////////

    /// Issues a new mint ticket.
    public fun new_mint_ticket(
        _: &AdminCap,
        character: u8,
        level: u8,
        attribute_points: u8,
        ctx: &mut TxContext,
    ): MintTicket {
        MintTicket {
            id: object::new(ctx),
            character,
            level,
            attribute_points,
        }
    }

    /// Transfers a mint ticket.
    public fun transfer_mint_ticket(_: &AdminCap, ticket: MintTicket, recipient: address) {
        transfer::transfer(ticket, recipient);
    }

    /// Issues a new mint ticket to the recipient.
    /// A convenience function for the CLI.
    public fun new_mint_ticket_to_recipient(
        cap: &AdminCap,
        character: u8,
        level: u8,
        attribute_points: u8,
        recipient: address,
        ctx: &mut TxContext,
    ) {
        transfer_mint_ticket(
            cap,
            new_mint_ticket(cap, character, level, attribute_points, ctx),
            recipient,
        );
    }

    /// Issues a new level-up ticket.
    public fun new_level_up_ticket(
        _: &AdminCap,
        hero_id: ID,
        attribute_points: u8,
        ctx: &mut TxContext,
    ): LevelUpTicket {
        LevelUpTicket {
            id: object::new(ctx),
            hero_id,
            attribute_points,
        }
    }

    /// Issues a new level-up ticket to the recipient.
    /// A convenience function for the CLI.
    public fun new_level_up_ticket_to_recipient(
        cap: &AdminCap,
        hero_id: ID,
        attribute_points: u8,
        recipient: address,
        ctx: &mut TxContext,
    ) {
        transfer::public_transfer(
            new_level_up_ticket(cap, hero_id, attribute_points, ctx),
            recipient,
        );
    }

    /// Burns an admin cap.
    public fun burn_admin_cap(cap: AdminCap) {
        let AdminCap { id } = cap;

        object::delete(id);
    }

    ////////////////////////////////////////////////////////////////////////////
    // Non-restricted operations.
    ////////////////////////////////////////////////////////////////////////////

    /// Mints a new hero with a mint ticket.
    public fun mint_hero(
        ticket: MintTicket,
        name: String,
        damage: u8,
        speed: u8,
        defense: u8,
        ctx: &mut TxContext,
    ): Hero {
        assert!(is_valid_hero_name(&name), EBadName);

        let MintTicket { id, character, level, attribute_points } = ticket;
        assert!(damage + speed + defense == attribute_points, EAttributePointsMismatch);

        object::delete(id);

        Hero {
            id: object::new(ctx),
            character,
            name,
            level,
            damage,
            speed,
            defense,
        }
    }

    /// Mints a new hero and transfer them to the recipient.
    /// A convenience function for the CLI.
    public fun mint_hero_to_recipient(
        ticket: MintTicket,
        name: String,
        damage: u8,
        speed: u8,
        defense: u8,
        recipient: address,
        ctx: &mut TxContext,
    ) {
        transfer::public_transfer(
            mint_hero(ticket, name, damage, speed, defense, ctx),
            recipient,
        );
    }

    /// Levels up a hero with a level-up ticket.
    public fun level_up_hero(
        hero: &mut Hero,
        ticket: LevelUpTicket,
        damage: u8,
        speed: u8,
        defense: u8,
    ) {
        let LevelUpTicket { id, hero_id, attribute_points } = ticket;
        assert!(object::borrow_id(hero) == &hero_id, EHeroIdMismatch);
        assert!(damage + speed + defense == attribute_points, EAttributePointsMismatch);

        object::delete(id);

        hero.level = hero.level + 1;
        hero.damage = hero.damage + damage;
        hero.speed = hero.speed + speed;
        hero.defense = hero.defense + defense;
    }

    /// Renames a hero.
    public fun rename_hero(hero: &mut Hero, name: String) {
        assert!(is_valid_hero_name(&name), EBadName);
        hero.name = name;
    }

    /// Burns a hero.
    public fun burn_hero(hero: Hero) {
        let Hero {
            id,
            character: _,
            name: _,
            level: _,
            damage: _,
            speed: _,
            defense: _,
        } = hero;

        object::delete(id);
    }

    ////////////////////////////////////////////////////////////////////////////
    // Utilities.
    ////////////////////////////////////////////////////////////////////////////

    fun is_valid_hero_name(name: &String): bool {
        !string::is_empty(name) && string::length(name) <= 128
    }
}
