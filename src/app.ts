import { fetchNftStatus, generateCrossMintRequest, mintNft } from "./api/crossmint";
import { generateReceipt, Item } from "./util/receipt-generator";
import { uploadImage } from "./api/shadow";
import { DESTINATION_ADDRESS, STORE_NAME } from "./config/constants";
import { generateRandomItems } from "./util/random-items";

const items = generateRandomItems((Math.floor(Math.random() * 10) + 1));
const storeName = STORE_NAME;
const orderId = `Order #00${Math.floor(Math.random() * 1000) + 1}`;
const destination = DESTINATION_ADDRESS;

(async () => {
    const receipt = await generateReceipt({items, storeName, orderId});
    const uri = await uploadImage(receipt);
    const request = await generateCrossMintRequest({destination, imgUrl: uri, items});
    const crossMintId = await mintNft(request);
    console.log(uri, '\n', crossMintId);
    // wait 45 seconds - TODO - replace with polling
    await new Promise(resolve => setTimeout(resolve, 45000));
    const results = await fetchNftStatus(crossMintId.id);
    console.log('✅ - OnChain Results:\n', results);
    console.log(`   - View NFT on CrossMint: https://www.crossmint.com/tokens/sol:${results.mintHash}`);
})();
