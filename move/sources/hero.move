// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

// Adapted from https://github.com/MystenLabs/sui/blob/2f37537d5c552934a60fe216afeed08175b92fe3/doc/book/examples/sources/basics/display.move

/// Example of an unlimited "Sui Hero" collection - anyone is free to
/// mint their Hero. Shows how to initialize the `Publisher` and how
/// to use it to get the `Display<Hero>` object - a way to describe a
/// type for the ecosystem.
module wallet_demo::my_hero {
    use sui::tx_context::{sender, TxContext};
    use std::string::{utf8, String};
    use sui::transfer;
    use sui::object::{Self, UID};

    // The creator bundle: these two packages often go together.
    use sui::package;
    use sui::display;

    /// The Hero - an outstanding collection of digital art.
    struct Hero has key, store {
        id: UID,
        name: String,
        img_url: String,
    }

    /// One-Time-Witness for the module.
    struct MY_HERO has drop {}

    /// In the module initializer we claim the `Publisher` object
    /// to then create a `Display`. The `Display` is initialized with
    /// a set of fields (but can be modified later) and published via
    /// the `update_version` call.
    ///
    /// Keys and values are set in the initializer but could also be
    /// set after publishing if a `Publisher` object was created.
    fun init(otw: MY_HERO, ctx: &mut TxContext) {
        let keys = vector[
            utf8(b"name"),
            utf8(b"link"),
            utf8(b"image_url"),
            utf8(b"description"),
            utf8(b"project_url"),
            utf8(b"creator"),
        ];

        let values = vector[
            utf8(b"{name}"),
            utf8(b"https://shinami.com"),
            utf8(b"{img_url}"),
            utf8(b"A true Hero of the Sui ecosystem!"),
            utf8(b"https://shinami.com"),
            utf8(b"Unknown Sui Fan")
        ];

        // Claim the `Publisher` for the package!
        let publisher = package::claim(otw, ctx);

        // Get a new `Display` object for the `Hero` type.
        let display = display::new_with_fields<Hero>(
            &publisher, keys, values, ctx
        );

        // Commit first version of `Display` to apply changes.
        display::update_version(&mut display);

        transfer::public_transfer(publisher, sender(ctx));
        transfer::public_transfer(display, sender(ctx));
    }

    /// Anyone can mint their `Hero`!
    public fun mint(name: String, img_url: String, ctx: &mut TxContext): Hero {
        let id = object::new(ctx);
        Hero { id, name, img_url }
    }

    /// Anyone can burn their `Hero` too!
    public fun burn(hero: Hero) {
        let Hero { id, name: _, img_url: _ } = hero;
        object::delete(id);
    }
}
