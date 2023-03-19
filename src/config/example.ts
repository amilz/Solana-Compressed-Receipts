import { clusterApiUrl } from "@solana/web3.js";
import { CrossMintNetwork } from "../api/crossmint";

// TODO Create a .env file for these values
export const DESTINATION_ADDRESS = 'YOUR_WALLET_ADDRESS';
export const STORE_NAME = 'Demo Store';
export const USDC_MINT = '6igW82pARLjuNPPssGdyoQt23FeoEqu8bm7nhmtpuEwX'; // Replace with your Devnet USDC
export const CROSSMINT_SECRET = 'YOUR_CROSSMINT_SECRET';
export const CROSSMINT_PROJECT = 'YOUR_CROSSMINT_PROJECT';
export const CROSSMINT_COLLECTION = 'default-solana'; // replace if you are not using default
export const CROSSMINT_NETWORK: CrossMintNetwork = 'staging'; // or 'www'
export const SHADOW_DIRECTORY = 'YOUR_SHADOW_DRIVE_KEY';
export const SOLANA_RPC = clusterApiUrl('devnet'); // Replace with your endpoint
export const SECRET = [0,0,0]; // Replace with your secret key `solana-keygen grind starts-with gm:1`