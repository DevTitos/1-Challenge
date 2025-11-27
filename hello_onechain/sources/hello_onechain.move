#[allow(duplicate_alias)]
module hello_onechain::hello_world {

    use std::string;
    use one::object::{Self, UID};
    use one::transfer;
    use one::tx_context::{Self, TxContext};


    public struct HelloWorldObject has key, store {
        id: UID,
        text: string::String
    }


    public entry fun mint(ctx: &mut TxContext) {
        let object = HelloWorldObject {
            id: object::new(ctx),
            text: string::utf8(b"Hello World!")
        };
        transfer::public_transfer(object, tx_context::sender(ctx));
    }
}