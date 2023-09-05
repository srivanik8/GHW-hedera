require("dotenv").config();

const { Client, PrivateKey, 
    AccountCreateTransaction, AccountBalanceQuery, 
    Hbar, TransferTransaction } = 
    require("@hashgraph/sdk");

    async function main() {
        const myAccountId = process.env.MY_ACCOUNT_ID;
    const myPrivateKey = process.env.MY_PRIVATE_KEY;
    const client = Client.forTestnet();
    client.setOperator(myAccountId, myPrivateKey);

    const newAccountPrivateKey = PrivateKey.generateED25519(); 
    const newAccountPublicKey = newAccountPrivateKey.publicKey;

    const newAccount = await new AccountCreateTransaction()
    .setKey(newAccountPublicKey)
    .setInitialBalance(Hbar.fromTinybars(1000))
    .execute(client);

    const getReceipt = await newAccount.getReceipt(client);
    const newAccountId = getReceipt.accountId;
    console.log("The new account ID is: " + newAccountId);
    
    const accountBalance = await new AccountBalanceQuery()
     .setAccountId(newAccountId)
     .execute(client);

    console.log("The new account balance is: "   +accountBalance.hbars.toTinybars() +" tinybar.");

    const sendHbar = await new TransferTransaction()
    .addHbarTransfer(myAccountId, Hbar.fromTinybars(-1000)) //Sending account
    .addHbarTransfer(newAccountId, Hbar.fromTinybars(1000)) //Receiving account
    .execute(client);

    const transactionReceipt = await sendHbar.getReceipt(client);
    console.log("The transfer transaction from my account to the new account was: " + transactionReceipt.status.toString());

    const getNewBalance = await new AccountBalanceQuery()
     .setAccountId(newAccountId)
     .execute(client);
    console.log("The account balance after the transfer is: " +getNewBalance.hbars.toTinybars() +" tinybar.")

}


main();