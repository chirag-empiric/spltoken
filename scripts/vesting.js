const solanaWeb3 = require('@solana/web3.js');
const splToken = require('@solana/spl-token');

const { Connection, PublicKey, Keypair } = solanaWeb3;
const { getOrCreateAssociatedTokenAccount, transfer } = splToken;

const connection = new Connection('https://api.mainnet-beta.solana.com');
const payer = Keypair.fromSecretKey(Uint8Array.from("ENTER YOUR SECRET KEY OF OWNER"));
const tokenMint = new PublicKey("MINT ADDRESS");
const tokenDecimals = 0;

const vestingSchedule = [
    { wallet: 'RecipientWalletAddress1', amount: 100 },
    { wallet: 'RecipientWalletAddress2', amount: 200 },
];

async function vestTokens() {
    for (const { wallet, amount } of vestingSchedule) {
        const recipientWallet = new PublicKey(wallet);
        const recipientTokenAccount = await getOrCreateAssociatedTokenAccount(
            connection,
            payer,
            tokenMint,
            recipientWallet
        );

        await transfer(
            connection,
            payer,
            recipientTokenAccount.address,
            amount * (10 ** tokenDecimals) // Adjust for token decimals, e.g., 6 decimals for USDC
        );

        console.log(`Transferred ${amount} tokens to ${wallet}`);
    }
}

vestTokens().catch(console.error);
