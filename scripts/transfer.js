const { Keypair, Transaction, Connection, PublicKey } = require("@solana/web3.js");
const { getAssociatedTokenAddress, createTransferCheckedInstruction, createAssociatedTokenAccountInstruction } = require("@solana/spl-token");
const { bs58 } = require("@coral-xyz/anchor/dist/cjs/utils/bytes");
require("dotenv").config();

const spltoken = process.env.TOKEN_MINT_ADDRESS
const owner = new PublicKey(process.env.OWNER);
const tokenDecimals = new PublicKey(process.env.TOKEN_DECIMALS);
const sourceWallet = Keypair.fromSecretKey(bs58.decode(owner));

const connection = new Connection("https://api.devnet.solana.com");

async function genAta() {
    let ata = await getAssociatedTokenAddress(
        spltoken,
        destWallet,
        false
    );
    console.log("ATA: ", ata);
    let tx = new Transaction();
    tx.add(
        createAssociatedTokenAccountInstruction(
            sourceWallet.publicKey,
            ata,
            destWallet,
            spltoken
        )
    );
    console.log(`ATA Created at: ${await connection.sendTransaction(tx, [sourceWallet])}`);
    await new Promise((resolve) => setTimeout(resolve, 100));
    return true;
}

const solanaTransferSpl = async (transferAmount, receiverAddress) => {
    let amount = transferAmount * 10 ** tokenDecimals;
    // const destWallet = new PublicKey("5VBgSgSrPncFEvW8Bt2QE61pPC94HpVUhLWd2sPVSRqN");
    const destWallet = new PublicKey(receiverAddress);
    let sourceTokenRaw = await getAssociatedTokenAddress(
        spltoken,
        sourceWallet.publicKey,
        false
    );

    let destTokenRaw = await getAssociatedTokenAddress(
        spltoken,
        destWallet,
        false
    );
    let sourceATA = sourceTokenRaw.toBase58();
    let destATA = destTokenRaw.toBase58();
    try {
        let transaction = new Transaction();
        transaction.add(
            createTransferCheckedInstruction(
                new PublicKey(sourceATA),
                spltoken,
                new PublicKey(destATA),
                sourceWallet.publicKey,
                amount,
                tokenDecimals
            )
        )
        let tx = await connection.sendTransaction(transaction, [sourceWallet])
        console.log('Tokens transferred Successfully, Receipt: ' + tx);
        return;
    }
    catch (error) {
        console.log("Generating ATA...")
        // console.log(error)
        let generateAta = await genAta();
        if (generateAta) {
            await new Promise((resolve) => setTimeout(resolve, 15000));
            solanaTransferSpl();
            return;
        }
    };
}


module.exports = solanaTransferSpl;
