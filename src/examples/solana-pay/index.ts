import { Connection, Keypair, PublicKey, sendAndConfirmTransaction, Transaction, TransactionInstruction } from '@solana/web3.js';
import { encodeURL, validateTransfer, parseURL, TransferRequestURL, findReference } from '@solana/pay';
import { DESTINATION_ADDRESS, SECRET, SOLANA_RPC, STORE_NAME, USDC_MINT } from '../../config/constants';
import { generateReceipt, Item } from '../../util/receipt-generator';
import { createTransferCheckedInstruction, getAssociatedTokenAddressSync, getMint } from '@solana/spl-token';
import { uploadImage } from '../../api/shadow';
import { fetchNftStatus, generateCrossMintRequest, mintNft } from '../../api/crossmint';
import BigNumber from 'bignumber.js';
import { generateRandomItems } from '../../util/random-items';

const destination = DESTINATION_ADDRESS;
const splAddress = USDC_MINT;
const payer = Keypair.fromSecretKey(new Uint8Array(SECRET));
const connection = new Connection(SOLANA_RPC, 'confirmed');
const recipient = new PublicKey(destination);
const reference = new Keypair().publicKey;
const memo = 'Solana Pay Compressed NFT Demo';
const items = generateRandomItems((Math.floor(Math.random() * 10) + 1));
const storeName = STORE_NAME;
const orderId = `Order #00${Math.floor(Math.random() * 1000) + 1}`;

/**
 * Simulate a checkout experience
 */
async function generateUrl(
    recipient: PublicKey,
    amount: BigNumber,
    reference: PublicKey,
    label: string,
    message: string,
    memo: string,
    splToken: PublicKey
) {
    /**
     * Create a payment request link
     */
    console.log('1. 📱 Simulate a Solana Pay QR Code');
    const url: URL = encodeURL({ recipient, amount, reference, label, message, memo, splToken });
    //console.log('   Payment request link:', url.href);
    return url;
}

async function processPayment(url: URL, payer: Keypair) {
    /**
     * Parse the payment request link
     */
    console.log('2. 📲 Parse the payment request link');
    const { recipient, amount, reference, memo, splToken } = parseURL(url) as TransferRequestURL;
    if (!recipient || !amount || !reference) throw new Error('Invalid payment request link');
    if (!splToken) throw new Error('Not an SPL Token payment request link');
    const tx = new Transaction();
    // Check that the token provided is an initialized mint
    const mint = await getMint(connection, splToken);
    if (!mint.isInitialized) throw new Error('mint not initialized');

    // Check that the amount provided doesn't have greater precision than the mint
    if ((amount.decimalPlaces() ?? 0) > mint.decimals) throw new Error('amount decimals invalid');

    // Convert input decimal amount to integer tokens according to the mint decimals
    let ixAmount = amount.times((new BigNumber(10)).pow(mint.decimals)).integerValue(BigNumber.ROUND_FLOOR);
    const senderATA = getAssociatedTokenAddressSync(splToken, payer.publicKey);
    const recipientATA = getAssociatedTokenAddressSync(splToken, recipient);
    const tokens = BigInt(String(ixAmount));
    const ix = createTransferCheckedInstruction(senderATA, splToken, recipientATA, payer.publicKey, tokens, mint.decimals);

    // TODO add checks and error handling

    // Add reference key if provided
    if (reference) {
        const ref = Array.isArray(reference) ? reference : [reference];
        for (const pubkey of ref) {
            ix.keys.push({ pubkey, isWritable: false, isSigner: false });
        }
    }

    // Add a memo if provided
    if (memo != null) {
        tx.add(
            new TransactionInstruction({
                programId: new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'),
                keys: [],
                data: Buffer.from(memo, 'utf8'),
            })
        );
    }

    tx.add(ix);

    console.log('3. 🚀 Send and Confirm Transaction');
    const txId = await sendAndConfirmTransaction(connection, tx, [payer]);
    console.log(`🎉  Tx: https://explorer.solana.com/tx/${txId}?cluster=devnet`);
}

async function verifyTx(
    recipient: PublicKey,
    amount: BigNumber,
    reference: PublicKey,
    memo: string,
    splToken: PublicKey
) {
    // Merchant app locates the transaction signature from the unique reference address it provided in the transfer link
    const found = await findReference(connection, reference);

    // Merchant app should always validate that the transaction transferred the expected amount to the recipient
    const response = await validateTransfer(
        connection,
        found.signature,
        {
            recipient,
            amount,
            splToken,
            reference,
            memo
        },
        { commitment: 'confirmed' }
    );
    return response;
}

async function main(
    recipient: PublicKey,
    reference: PublicKey,
    memo: string,
    splAddress: string,
    items: Item[],
    storeName: string,
    orderId: string
) {
    const round2Decimnal = (num: number) => Math.round(num * 100) / 100;
    const total = items.reduce((acc, item) => acc + item.cost, 0);
    const amount = new BigNumber(round2Decimnal(total));
    const splToken = new PublicKey(splAddress);
    const url = await generateUrl(recipient, amount, reference, storeName, orderId, memo, splToken);
    await processPayment(url, payer);
    const response = await verifyTx(recipient, amount, reference, memo, splToken);
    if (!response || response.meta?.err) throw new Error('Not verified');
    const receipt = await generateReceipt({ items, storeName, orderId });
    const uri = await uploadImage(receipt);
    const request = await generateCrossMintRequest({ destination, imgUrl: uri, items });
    const crossMintId = await mintNft(request);
    // wait 45 seconds - TODO - replace with polling
    await new Promise(resolve => setTimeout(resolve, 45000));
    const results = await fetchNftStatus(crossMintId.id);
    console.log('✅ - OnChain Results:\n', results);
    console.log(`   - View NFT on CrossMint: https://www.crossmint.com/tokens/sol:${results.mintHash}`);
}

(async () => {
    try {
        await main(recipient, reference, memo, splAddress, items, storeName, orderId);
        console.log('Success');
    } catch (err) {
        console.error(err);
    }
})();

