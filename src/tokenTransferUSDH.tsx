import { useState } from 'react';
import { useCurrentAccount, useSuiClient, useSignTransaction } from "@onelabs/dapp-kit";
import { Flex, Heading, Text, Button } from "@radix-ui/themes";
import { Transaction } from "@onelabs/sui/transactions"

export function TokenTransfer() {
    const account = useCurrentAccount();
    const client = useSuiClient();
    const { mutateAsync: signTransaction } = useSignTransaction();
    const [recipient, setRecipient] = useState('');
    const [amount, setAmount] = useState('');
    const [message, setMessage] = useState('');
    const [txDigest, setTxDigest] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleTransfer = async () => {
        const amountToTransfer = parseFloat(amount);
        if (!recipient || !amountToTransfer || amountToTransfer <= 0) {
            setMessage('Please enter a valid recipient and amount.');
            setLoading(false);
            return
        }
        setLoading(true)
        try {
            // Convert USDH to MIST (1 USDH = 1,000,000,000 MIST)
            const amountInMist = Math.floor(amountToTransfer * 1_000_000_000)

            // Get user's USDH coin objects - OneChain USDH token type
            let coins = await client.getCoins({
                owner: account?.address!,
                coinType: "0x72eba41c73c4c2ce2bcfc6ec1dc0896ba1b5c17bfe7ae7c6c779943f84912b41::usdh::USDH", // OneChain USDH token type
            })

            // If still no coins, try without coinType to get all coins
            if (coins.data.length === 0) {
                coins = await client.getCoins({
                    owner: account?.address!,
                })
            }

            if (coins.data.length === 0) {
                throw new Error("No USDH tokens found in wallet. Please use the faucet to get testnet tokens.")
            }

            // Create transaction
            const tx = new Transaction()
            tx.setSenderIfNotSet(account?.address!)

            // Use the first coin object for transfer
            const primaryCoin = coins.data[0].coinObjectId
            console.log('coin object id:', primaryCoin)
            console.log('balance:', coins.data[0].balance)
            // If we need more than what's in the first coin, merge coins first
            if (coins.data.length > 1) {
                // Merge all coins to have enough balance
                const coinObjects = coins.data.map(coin => tx.object(coin.coinObjectId))
                tx.mergeCoins(tx.object(primaryCoin), coinObjects.slice(1))
                console.log('Merged coin object id');
            }

            // Split the required amount
            const [coinToTransfer] = tx.splitCoins(tx.object(primaryCoin), [amountInMist])
            tx.transferObjects([coinToTransfer], recipient)

            const { bytes, signature, reportTransactionEffects } = await signTransaction({
                transaction: tx,
            });
            const executeResult = await client.executeTransactionBlock({
                transactionBlock: bytes,
                signature,
                options: {
                    showRawEffects: true,
                },
            });
            setTxDigest(executeResult.digest || null); // Use the result to get the transaction digest
            setMessage('Transfer submitted!');
            console.log(executeResult);
            // Always report transaction effects to the wallet after execution
            reportTransactionEffects(executeResult.digest);
        } catch (error: any) {
            console.error("Transaction error:", error)
        } finally {
            setLoading(false)
        }
    }

    if (!account) {
        return <Text>Please connect your wallet.</Text>;
    }

    return (
        <Flex direction="column" my="2" style={{ maxWidth: 420, margin: '0 auto', padding: 24, border: '1px solid #eee', borderRadius: 12, background: '#fafbfc' }}>
            <Heading color="red" size="4" mb="2">USDH testnet Coin Transfer Demo</Heading>
            <Text color="red" mb="2">Sender: <b>{account.address}</b></Text>
            <input
                placeholder="Recipient Address (0x...)"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                style={{ marginBottom: '8px', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                disabled={loading}
            />
            <input
                placeholder="Amount (USDH)"
                type="number"
                min="0"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                style={{ marginBottom: '8px', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                disabled={loading}
            />
            <Button onClick={handleTransfer} disabled={loading} style={{ marginBottom: 8 }}>
                {loading ? 'Sending...' : 'Send USDH'}
            </Button>
            {message && <Text mb="2">{message}</Text>}
            {txDigest && (
                <Text>
                    View on Explorer:{' '}
                    <a href={`https://onescan.cc/testnet/transactionBlocksDetail?digest=${txDigest}`} target="_blank" rel="noopener noreferrer">
                        {txDigest}
                    </a>
                </Text>
            )}
        </Flex>
    );
}