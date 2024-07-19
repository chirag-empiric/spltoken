const { Keypair, Transaction, Connection, PublicKey } = require("@solana/web3.js");
const { getAssociatedTokenAddress, createTransferCheckedInstruction, createAssociatedTokenAccountInstruction } = require("@solana/spl-token");
const { bs58 } = require("@coral-xyz/anchor/dist/cjs/utils/bytes");

const owner = "3athqFzWSks9otL3rZgQHoQLGS9iZvoLcBmrMu2BWjcfBwNutUcHYp1PfN1wZ9FtLfQ5MEYbKnNjVSHDG9p3gTMz" // private key string previously obtained 
const spltoken = new PublicKey("9DtdajeoxgjNc6dfLPmeTnPGevzQaUF6MXoCiYkpM3Tn"); // Program Id of your SPL Token, obtained during "anchor deploy"
const sourceWallet = Keypair.fromSecretKey(bs58.decode(owner));
const connection = new Connection("https://api.devnet.solana.com");

const destWallet = new PublicKey("AZCMD8PAuRW9RqVksLxztTiUobbxFw3xq6Cf8oUVi9ve");
const tokens = 143; // set the amount of tokens to transfer.

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
    console.log(`create ata txhash: ${await connection.sendTransaction(tx, [sourceWallet])}`);
    await new Promise((resolve) => setTimeout(resolve, 100));
    return true;
}

const solanaTransferSpl = async () => {
    let amount = tokens * 10 ** 0;
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
                0
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


solanaTransferSpl();
