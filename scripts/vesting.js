const solanaTransferSpl = require('./transfer'); // Fixed import statement

const vestingSchedule = [
    { wallet: "AZCMD8PAuRW9RqVksLxztTiUobbxFw3xq6Cf8oUVi9ve", amount: 10 },
    { wallet: "5VBgSgSrPncFEvW8Bt2QE61pPC94HpVUhLWd2sPVSRqN", amount: 20 },
];

async function vestTokens() {
    try {
        let promises = [];
        for (const { wallet, amount } of vestingSchedule) {
            console.log("Wallet and Amount is: ", wallet, amount);
            promises.push(solanaTransferSpl(amount, wallet));
        }

        let response = await Promise.all(promises); // Await the completion of all promises
        console.log("All token transfers completed:", response);
    } catch (error) {
        console.error("Error during token vesting:", error);
    }
}

// CALL BY CRONJOB
// vestTokens().catch(console.error);