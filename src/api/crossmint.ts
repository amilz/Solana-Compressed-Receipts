import { Item } from "../util/receipt-generator";
import { CROSSMINT_PROJECT, CROSSMINT_SECRET, CROSSMINT_COLLECTION, CROSSMINT_NETWORK } from "../config/constants";

interface Args {
    destination: string;
    imgUrl: string;
    items: Item[]
}
interface CmMintResponse {
    id: string,
    onChain: OnChain,
    metadata?: Metadata;
}

interface Metadata {
    name: string;
    symbol: string;
    description: string;
    seller_fee_basis_points: number;
    image: string;
    attributes?: unknown | null;
    properties: unknown;
}

interface OnChain {
    status: string;
    chain: string;
    mintHash?: string;
    owner?: string;
}

export function generateCrossMintRequest({ destination, imgUrl, items }: Args): RequestInit {
    const options = {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
            'x-client-secret': CROSSMINT_SECRET,
            'x-project-id': CROSSMINT_PROJECT
        },
        body: JSON.stringify({
            recipient: `solana:${destination}`,
            //recipient: 'email:useremail@gmail.com:solana', // Optional use email address instead
            metadata: {
                name: 'Demo Compressed Receipt',
                symbol: 'RECEIPT',
                seller_fee_basis_points: 0,
                image: imgUrl,
                description: 'This is a sample compressed NFT Receipt.',
                attributes: items.map(item => { return { trait_type: item.item, value: item.cost.toFixed(2) } })
            },
            properties: {
                files: [
                    {
                        "uri": imgUrl,
                        "type": "image/png"
                    }
                ],
                category: 'image',
            }

        })
    };
    return options;
}

export async function mintNft(options: RequestInit): Promise<{ id: string }> {
    try {
        let response = await fetch(`https://${CROSSMINT_NETWORK}.crossmint.com/api/v1-alpha1/minting/collections/${CROSSMINT_COLLECTION}/nfts`, options);
        let result = (await response.json()) as CmMintResponse;
        console.log(`5.  Sent to CrossMint - CMID: ${result.id}`)
        return {
            id: result.id
        };
    }
    catch (err) {
        console.log(err);
        throw new Error('Error during minting');
    }
}

export async function fetchNftStatus(id: string): Promise<OnChain> {
    try {
        const options = {
            method: 'GET',
            headers: {
                'x-client-secret': CROSSMINT_SECRET,
                'x-project-id': CROSSMINT_PROJECT
            }
        };
        const url = `https://${CROSSMINT_NETWORK}.crossmint.com/api/v1-alpha1/minting/collections/${CROSSMINT_COLLECTION}/nfts/${id}`;
        let response = await fetch(url, options);
        let result = (await response.json()).onChain as OnChain;
        return result;
    }
    catch (err) {
        console.log(err);
        throw new Error('Error during minting');
    }
}

export type CrossMintNetwork = 'www' | 'staging';