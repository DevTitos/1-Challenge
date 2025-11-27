import { useSignAndExecuteTransaction as useSignAndExecuteTransactionBlock, useSuiClient } from '@onelabs/dapp-kit';
import { Transaction } from '@onelabs/sui/transactions';

import { HELLO_ONECHAIN_PACKAGE_ID } from './constants';
import { Flex } from '@radix-ui/themes';

export function Mint({ 
    onCreated,
}:{
    onCreated: (id: string) => void;
 }) {
    const { mutate: signAndExecute } = useSignAndExecuteTransactionBlock();
    const client = useSuiClient();

   
    return (
        <Flex direction="column" my="2">
            <div>
                <button
                    onClick={() => {
                        mint();
                    }}
                >
                    mint
                </button>
            </div>
        </Flex>


    );

    
    function mint() {
        const txb = new Transaction();
        
        txb.moveCall({
            target: `${HELLO_ONECHAIN_PACKAGE_ID}::hello_world::mint`,
        });

        signAndExecute(
            {
                transaction: txb,
            },
            {
               
onSuccess: async (result) => {
    const digest = result.digest;
    await client.waitForTransaction({
        digest,
    });
    const txResponse = await client.getTransactionBlock({
        digest,
        options: { showEffects: true },
    });
    const objectId = txResponse.effects?.created?.[0]?.reference?.objectId;

    if (objectId) {
        onCreated(objectId);
    }
},
            },
        );
    }
}